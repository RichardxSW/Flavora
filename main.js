const express = require('express');
const app = express();
const cors = require("cors");
const passport = require("passport");
const authGoogle = require("./routes/auth")
const authLocal = require("./routes/authLocal")
const expressLayouts = require("express-ejs-layouts");
const cookieSession = require("cookie-session");
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const Recipes = require('./models/recipesModel');
const User = require("./models/userModel");
const LocalUser = require("./models/localuserModel");
const pinRouter = require('./routes/api/pinRecipe');
const folderRouter = require('./routes/api/folder');
const adminRouter = require('./routes/api/admin'); 
const reviewRouter = require('./routes/api/review'); 
const accountRouter = require('./routes/api/account');
const profileRouter = require('./routes/api/profile');
dotenv.config();

// Import middleware from routes/api
const { createAdmin, initializeDatabase, checkUser, redirectTrailingSlash, isAuthenticated } = require('./routes/api/middleware');

// Port dan URL MongoDB
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(flash());

// Konfigurasi cookie dan session
app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 1000 })
);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport routes
app.use("/auth", authGoogle);
app.use("/auth", authLocal);

// Custom middleware
app.use(redirectTrailingSlash);
app.use(checkUser);

// Routes
app.use('/', accountRouter);
app.use('/admin', adminRouter);
app.use('/', pinRouter);
app.use('/', folderRouter);
app.use('/review', reviewRouter);
app.use('/', profileRouter);

// MongoDB Connection
mongoose.connect(MONGO_URL)
    .then(async () => {
        console.log(`MongoDB connected at ${MONGO_URL}`);
        try {
            await createAdmin();
            await initializeDatabase();
        } catch (error) {
            console.error('Error creating admin account:', error);
        }

    })
    .catch(err => console.log(err))

// Menampilkan halaman home
app.get('/home', checkUser, isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            // Tentukan kategori resep yang akan ditampilkan berdasarkan waktu sekarang
            let categoryFilter= [];
            const hour = new Date().getHours();

            if (hour >= 6 && hour < 12) { // Pagi (06:00 - 11:59)
                categoryFilter = ["Breakfast"];
            } else if (hour >= 12 && hour < 18) { // Siang (12:00 - 17:59)
                categoryFilter = ["Lunch"];
            } else if (hour >= 18 || hour < 6) { // Malam (18:00 - 05:59)
                categoryFilter = ["Dinner"];
            }

            const recommendedRecipe = await Recipes.aggregate([
                {
                    $match: {
                        category: { $in: categoryFilter }
                    }
                },
                {
                    $project: {
                        recipeID: 1,
                        title: 1,
                        desc: 1,
                        img: 1,
                        time: 1,
                        category: 1,
                        averageRating: 1,
                        pinnedCount: { $size: { $concatArrays: ['$pinnedBy', '$pinnedByGoogle'] } },
                        lastSeenCount: { $size: '$lastSeenBy' }
                    }
                },
                {
                    $sort: {
                        averageRating: -1,
                        pinnedCount: -1,
                        lastSeenCount: -1
                    }
                },
                {
                    $limit: 1
                }
            ]);

            // Cek apakah ada resep yang direkomendasikan
            if (recommendedRecipe.length === 0) {
                // Jika tidak ada resep yang ditemukan, gunakan resep paling populer secara umum
                const popularRecipes = await Recipes.aggregate([
                    {
                        $project: {
                            recipeID: 1,
                            title: 1,
                            desc: 1,
                            img: 1,
                            time: 1,
                            category: 1,
                            averageRating: 1,
                            pinnedCount: { $size: { $concatArrays: ['$pinnedBy', '$pinnedByGoogle'] } },
                            lastSeenCount: { $size: '$lastSeenBy' }
                        }
                    },
                    {
                        $sort: {
                            averageRating: -1,
                            pinnedCount: -1, // Mengurutkan berdasarkan jumlah pinnedBy+pinnedByGoogle terbanyak
                            lastSeenCount: -1 // Mengurutkan berdasarkan jumlah lastSeenBy terbanyak
                        }
                    },
                    {
                        $limit: 1
                    }
                ]);
                res.render('index', {
                    recipes: recipes,
                    recommendedRecipe: recommendedRecipe[0], // Mengambil resep yang direkomendasikan
                    popularRecipes: popularRecipes[0], // Mengambil resep paling populer
                    user: req.userData,
                    isAdmin: req.user.isAdmin,
                    title: 'Home', 
                    layout: "mainlayout"
                });
            } else {
                res.render('index', {
                    recipes: recipes,
                    recommendedRecipe: recommendedRecipe[0], // Mengambil resep yang direkomendasikan
                    user: req.userData,
                    isAdmin: req.user.isAdmin,
                    title: 'Home', 
                    layout: "mainlayout"
                });
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error");
    }
});

// Menampilkan halaman search
app.get('/search', isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            const searchQuery = req.query.q ? req.query.q.trim().toLowerCase() : '';
            let filteredRecipes = recipes.filter(recipe => {
                return (
                    recipe.title.toLowerCase().includes(searchQuery) ||
                    (Array.isArray(recipe.category) && recipe.category.some(cat => cat.toLowerCase().includes(searchQuery)))
                );
            });

                // Menangani sort berdasarkan waktu
              if (req.query.sort === 'time') {
                filteredRecipes.sort((a, b) => {
                    return a.minutes - b.minutes;
                });
            } else if (req.query.sort === 'averageRating') {
                filteredRecipes.sort((a, b) => {
                    return b.averageRating - a.averageRating;
                });
            } else if (req.query.sort === 'totalReviews') {
                filteredRecipes.sort((a, b) => {
                    return b.totalReviews - a.totalReviews;
                });
            }

            res.render('search', {
                recipes: recipes,
                filteredRecipes: filteredRecipes,
                user: req.userData,
                isAdmin: req.user.isAdmin,
                title: 'Search',
                layout: "mainlayout",
            });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error");
    }
});

// Menampilkan halaman detail
app.get('/detail/:recipeID', isAuthenticated, async (req, res) => {
    try {
        const recipeID = req.params.recipeID
        const recipes = await Recipes.findOne({ recipeID })
        const relatedRecipes = await Recipes.find({ category: recipes.category, _id: { $ne: recipes._id } });
        const resep = await Recipes.find()

        if (recipes) {
            // Perbarui properti lastSeenBy untuk pengguna saat ini
            if (req.user) {
                const user = req.user;

                // Temukan atau buat entri lastSeenBy untuk pengguna saat ini
                const userLastSeen = recipes.lastSeenBy.find(entry => entry.user.equals(user._id));
                if (userLastSeen) {
                    // Jika pengguna sudah ada dalam lastSeenBy, update lastSeenAt
                    userLastSeen.lastSeenAt = new Date();
                } else {
                    // Jika pengguna belum ada dalam lastSeenBy, tambahkan entri baru
                    recipes.lastSeenBy.push({ user: user._id, lastSeenAt: new Date() });
                }

                // Simpan perubahan ke database
                await recipes.save();
            }

            res.render('detail', {
                resep: resep,
                recipes: recipes ,
                relatedRecipes: relatedRecipes, 
                user: req.userData,
                isAdmin: req.user.isAdmin,
                title: 'Detail' + ` ${recipes.title}`, 
                layout: "mainlayout"})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

// Menampilkan halaman latest seen
app.get('/latest-seen', isAuthenticated, async (req, res) => {
    try {
        // Ambil ID pengguna dari sesi
        const userId = req.user._id;

        let user;
        if (req.user.googleId) {
            user = await User.findById(userId).populate('savedRecipes'); // Jika pengguna Google
        } else {
            user = await LocalUser.findById(userId).populate('savedRecipes'); // Jika pengguna lokal
        }

        if (user) {
            // Temukan resep-resep yang terakhir dilihat oleh pengguna
            const latestSeenRecipes = await Recipes.find({ 'lastSeenBy.user': userId })
                .sort({ 'lastSeenBy.lastSeenAt': -1 }) // Urutkan berdasarkan waktu terakhir dilihat secara menurun
                .populate('lastSeenBy.user')
                .limit(10); // Batasi jumlah resep terakhir yang dilihat

            const folders = user.folders;
            // Render halaman "latest seen" dengan resep-resep yang terakhir dilihat
            res.render('latestSeen', { 
                latestSeenRecipes: latestSeenRecipes,
                user: req.userData,
                folders: folders,
                isAdmin: req.user.isAdmin,
                title: 'Latest Seen',
                layout: "mainlayout"
            });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
    
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
