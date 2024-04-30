const express = require('express');
const app = express();
const cors = require("cors");
const passportSetup = require("./passport");
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
const fs = require('fs');
const Recipes = require('./models/recipesModel');
const User = require("./models/userModel");
const LocalUser = require("./models/localuserModel");
const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require('path');
const { profile } = require('console');
const { userInfo } = require('os');
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts); 
app.use(express.json());
app.use(morgan('dev'));
app.use(flash());
app.use('/api/recipes' ,require("./routes/api/recipesAPI"))

mongoose.connect(MONGO_URL)
    .then(async () => {
        console.log(`MongoDB connected at ${MONGO_URL}`);

        try {
            await createAdmin();
        } catch (error) {
            console.error('Error creating admin account:', error);
        }

        const count = await Recipes.countDocuments();
        if (count == 0) {
            const dataJSON = fs.readFileSync('public/recipes.json');
            const data = JSON.parse(dataJSON);
            
            // Masukkan data ke MongoDB
            try {
                await Recipes.insertMany(data);
                console.log('Data berhasil dimasukkan ke MongoDB');
            } catch (err) {
                console.error(err);
            }
        } else {
            console.log('Database sudah berisi data');
        }
    })
    .catch(err => console.log(err))

    async function createAdmin() {
        try {
            // Cek apakah sudah ada admin
            const existingAdmin = await LocalUser.findOne({ isAdmin: true });
            if (!existingAdmin) {
                // Jika tidak ada admin, buat satu
                const adminData = {
                    email: 'admin@admin',
                    password: 'admin', // Gunakan kata sandi mentah
                    username: 'Admin',
                    profilePicture: 'profilepic.jpg',
                    isAdmin: true
                };

                 // Hash kata sandi
                const hashedPassword = await bcrypt.hash(adminData.password, 10);
                // Simpan kedua versi kata sandi
                adminData.hashedPassword = hashedPassword; // Simpan kata sandi yang di-hash
    
                // Buat objek admin baru
                const newAdmin = new LocalUser(adminData);
    
                // Simpan objek admin ke database
                await newAdmin.save();
            }
        } catch (error) {
            throw error;
        }
    }

    async function checkUser(req, res, next) {
        let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
            if (!req.user) {
                return res.redirect('/');
                // Jika pengguna belum login, hapus session.freshUserData jika ada
                if (req.session.freshUserData) {
                    delete req.session.freshUserData;
                };
            } else {
                // Jika pengguna sudah login
                if (!userData || Object.keys(userData).length === 0) {
                    // Jika userData kosong, isi dengan data pengguna dari req.user
                    if (req.user.username) { 
                        userData = {
                            name: req.user.username || '', 
                            profilePicture: req.user.profilePicture,
                            _id: req.user._id
                        };
                    } else {
                        userData = {
                            name: req.user.displayName || '',
                            profilePicture: req.user.profilePicture || '',
                            _id: req.user._id
                        };
                    }
                } else {
                    // Jika userData sudah terisi, ubah nama-nama properti sesuai keinginan
                    userData.name = userData.username;
                }
            }
            req.userData = userData;
            next();
    }

app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 1000 })
);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authGoogle);
app.use("/auth", authLocal);
app.use(express.static('public'));

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
);

app.use((req, res, next) => {
    if (req.path.slice(-1) === '/' && req.path.length > 1) {
      const query = req.url.slice(req.path.length)
      const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
      res.redirect(301, safepath + query)
    } else {
      next()
    }
  })

  app.use(checkUser); 

app.get('/', (req, res) => {
    res.render('login.ejs', {title: 'Login', layout: "accountlayout"});
});


function isLoggedIn(req,res,next){
    req.user? next(): res.sendStatus(401);
}

app.delete('/', isLoggedIn, async (req, res) => {
    try {
        // await User.findByIdAndDelete(req.user._id);
        req.logout();
        if (req.session.freshUserData) {
            delete req.session.freshUserData;
        };
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/register', (req, res) => {
    res.render('regis.ejs', {title: 'Register', layout: "accountlayout"});
});

app.post('/register', async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const localuser = new LocalUser({ 
        email : req.body.email,
        username: req.body.username,
        hashedPassword: hashedPassword, 
        password: req.body.password,
        profilePicture: 'profilepic.jpg'});
    try {
      await localuser.save();
      req.flash('successMsg', 'Successfully registered')
      res.redirect('/local');
    } catch (error){
      req.flash('errorMsg', 'Registration failed')
      res.redirect('/register');
    }
  });

app.get('/local', (req, res) => {
    res.render('loginEmail.ejs', {
        title: 'Login', 
        layout: "accountlayout",
        });
        req.flash('error','incorrect login')
});

app.post('/local', passport.authenticate('local',{
    successRedirect: '/home',
    failureRedirect: '/local',
    failureFlash: true
}));

// Middleware untuk memeriksa apakah pengguna terautentikasi dan jenis otentikasi
function isAuthenticated(req, res, next) {
    if (req.user) {
        // Jika pengguna terautentikasi dan objek req.user ada
        return next();
    } else {
    // Jika pengguna tidak terautentikasi atau req.user tidak ada, redirect ke halaman login
    res.redirect('/');
    }
}

app.get('/profile', (req, res) => {
    let name = '';
    let email = '';
    let password = '';
    let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
    let errorMsg = req.flash('error');
    let successMsg = req.flash('success');

    if (!req.user) {
        // Jika pengguna belum login, hapus session.freshUserData jika ada
        if (req.session.freshUserData) {
            delete req.session.freshUserData;
        }
    } else {
        // Jika pengguna sudah login
        if (!userData || Object.keys(userData).length === 0) {
            // Jika userData kosong, isi dengan data pengguna dari req.user
            if (req.user.username) { 
                userData = {
                    name: req.user.username || '', 
                    profilePicture: req.user.profilePicture,
                    email: req.user.email || '',
                    password: maskPassword(req.user.password || ''),
                    _id: req.user._id
                };
            } else {
                userData = {
                    name: req.user.displayName || '',
                    profilePicture: req.user.profilePicture || '',
                    email: req.user.email || '',
                    password: maskPassword(req.user.password || ''),
                    _id: req.user._id
                };
            }
        } else {
            // Jika userData sudah terisi, ubah nama-nama properti sesuai keinginan
            userData.name = userData.username;
            userData.password = maskPassword(userData.password || ''); // Ubah password menjadi masked version
        }
    }

    res.render('profile', {
        user: userData,
        errorMsg: errorMsg,
        successMsg: successMsg,
        title: 'Profile', 
        layout: 'accountLayout'
    });
});

function maskPassword(password) {
    return '*'.repeat(password.length);
}

app.get('/edit', isAuthenticated, async(req, res) => {
    try {
        const id = req.query.id;
        const userData = await LocalUser.findById(id);

        if(userData){
            res.render('edit', {
                user: userData,
                title: 'Edit', 
                layout: "accountLayout"});
        }
        else{
            req.flash('errorMsg', 'Account can not be modified.');
            res.redirect('/profile');
        }
    } catch (error) {
        console.log(error.message);
    }
});

// Konfigurasi penyimpanan file dengan multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public/userImages')) // Menentukan direktori penyimpanan file
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name) // Menentukan nama file yang diunggah
    }
});

// Inisialisasi multer dengan konfigurasi penyimpanan
const upload = multer({ storage: storage });

app.post('/edit', upload.single('image'), async(req, res) => {
    try {
        let userData = {};
        const id = req.body.user_id;

        if (req.file) {
            // Jika ada file yang diunggah, simpan informasi file ke dalam userData
            userData = {
                username: req.body.name,
                email: req.body.email,
                password: req.body.password,
                profilePicture: req.file.filename // Gunakan req.file.filename untuk mendapatkan nama file yang disimpan oleh multer
            };

            // Menghapus foto lama jika ada dan bukan 'profilepic.jpg'
            const oldUserData = await LocalUser.findById(id);
            if (oldUserData.profilePicture && oldUserData.profilePicture !== 'profilepic.jpg') {
                const oldImagePath = path.join(__dirname, '/public/userImages', oldUserData.profilePicture);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`File ${oldUserData.profilePicture} telah dihapus.`);
                }
            }
        } else {
            // Jika tidak ada file yang diunggah, hanya simpan informasi pengguna
            userData = {
                username: req.body.name,
                email: req.body.email,
                password: req.body.password
            };
        }

        // Update data pengguna di MongoDB
        const updatedUserData = await LocalUser.findByIdAndUpdate(id, { $set: userData }, { new: true });

        // Ambil data terbaru dari MongoDB
        const freshUserData = await LocalUser.findById(id);

        // Simpan freshUserData di dalam sesi atau cookie
        req.session.freshUserData = freshUserData;

        // Redirect ke halaman profil setelah berhasil update
        req.flash('successMsg', 'Account updated successfully.');
        res.redirect('/profile');

    } catch (error) { 
        console.log(error.message);
    }
});

app.get('/home', isAuthenticated, async (req, res) => {
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

app.post('/postReview/:recipeID', async (req, res) => {
    try {
        const { recipeID } = req.params;
        const { rating, review, date, name , photo } = req.body;

        // Lakukan sesuatu dengan data yang diterima, misalnya menyimpan ke database menggunakan Mongoose
        // Contoh:
        const recipe = await Recipes.findOne({ recipeID });
        if (!recipe) {
            return res.status(404).send("Recipe not found");
        }
        // Menambahkan review ke resep
        recipe.reviews.push({
            rating,
            review,
            date,
            name,
            photo
        });

        // Hitung totalRating, totalReviews, dan averageRating yang baru
        const totalReviews = recipe.reviews.length;
        let totalRating = 0;
        let averageRating = 0;
        if (totalReviews > 0) {
            for (let i = 0; i < totalReviews; i++) {
                totalRating += parseInt(recipe.reviews[i].rating);
            }
            averageRating = totalRating / totalReviews;
            averageRating = averageRating.toFixed(1);
        }

        // Simpan totalReviews dan averageRating ke dalam dokumen resep
        recipe.totalReviews = totalReviews;
        recipe.averageRating = averageRating;

        await recipe.save();

        res.status(201).send("Review added successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk menghapus komentar dari resep
app.delete('/deleteComment/:recipeID/:commentID', async (req, res) => {
    try {
        // Ambil ID resep dan ID komentar dari parameter route
        const recipeID = req.params.recipeID;
        const commentID = req.params.commentID;

        // Lakukan operasi penghapusan komentar dari resep di database
        // Misalnya, menggunakan model Recipes
        await Recipes.updateOne({ recipeID: recipeID }, { $pull: { reviews: { _id: commentID } } });

        // Kirim respon yang berhasil
        res.status(200).end();
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/editComment/:commentID', async (req, res) => {
    try {
        const commentID = req.params.commentID;
        const { newComment } = req.body;

        // Lakukan operasi pengeditan komentar di database (contoh: menggunakan model Recipes)
        const updatedReview = await Recipes.findOneAndUpdate(
            { 'reviews._id': commentID },
            { $set: { 'reviews.$.review': newComment } },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Kirim respon yang berhasil
        res.status(200).json({ message: 'Comment updated successfully', updatedReview });
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error editing comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/pinrecipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            // Tambahkan pengguna ke daftar yang mem-pin resep
            await Recipes.findByIdAndUpdate(recipeId, { $addToSet: { pinnedBy: { user: userId, status: 'pinned' } } });
            user.savedRecipes.addToSet(recipeId);
            await user.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else if (gUser) {
            await Recipes.findByIdAndUpdate(recipeId, { $addToSet: { pinnedByGoogle: { user: userId, status: 'pinned' } } });
            gUser.savedRecipes.addToSet(recipeId);
            await gUser.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/unpinrecipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            // Hapus pengguna dari daftar yang mem-pin resep
            await Recipes.findByIdAndUpdate(recipeId, { $pull: { pinnedBy: { user: userId } } });
            user.savedRecipes.pull(recipeId);
            await user.save();

            // Loop melalui setiap folder pengguna
            for (const folder of user.folders) {
                // Jika resep ada dalam folder, hapus dari folder
                if (folder.recipes.includes(recipeId)) {
                    folder.recipes.pull(recipeId);
                }
            }
            // Simpan perubahan
            await user.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe unpinned successfully' });
        } else if (gUser) {
            await Recipes.findByIdAndUpdate(recipeId, { $pull: { pinnedByGoogle: { user: userId } } });
            gUser.savedRecipes.pull(recipeId);
            await gUser.save();

            // Loop melalui setiap folder pengguna
            for (const folder of gUser.folders) {
                // Jika resep ada dalam folder, hapus dari folder
                if (folder.recipes.includes(recipeId)) {
                    folder.recipes.pull(recipeId);
                }
            }
            // Simpan perubahan
            await gUser.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/checkpinstatus/:recipeId', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.params.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            const recipe = await Recipes.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }

            const pinStatus = recipe.pinnedBy.find(pin => pin.user.equals(userId));
            const isPinned = pinStatus && pinStatus.status === 'pinned';

            res.status(200).json({ isPinned });
        } else if (gUser) {
            const recipe = await Recipes.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }

            const pinStatus = recipe.pinnedByGoogle.find(pin => pin.user.equals(userId));
            const isPinned = pinStatus && pinStatus.status === 'pinned';

            res.status(200).json({ isPinned });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/pinned', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        let user;
        if (req.user.googleId) {
            user = await User.findById(userId).populate('savedRecipes'); // Jika pengguna Google
        } else {
            user = await LocalUser.findById(userId).populate('savedRecipes'); // Jika pengguna lokal
        }

        if (user) {
            // Ambil daftar resep yang disimpan oleh pengguna
            const savedRecipes = user.savedRecipes;

            // Ambil semua resep
            const allRecipes = await Recipes.find();

            // Hitung jumlah total halaman
            const totalPages = Math.ceil( (savedRecipes.length) / limit);

            const folders = user.folders;

            // Ambil resep untuk halaman saat ini menggunakan skip dan limit
            const paginatedRecipes = savedRecipes.slice(skip, skip + limit);

            res.render('pinned', {
                savedRecipes: paginatedRecipes,
                savedRecipesCount: savedRecipes,
                folders: folders,
                recipes: allRecipes,
                title: 'Pinned',
                layout: "mainlayout",
                user: req.userData,
                isAdmin: req.user.isAdmin,
                totalPages: totalPages,
                limit: limit,
                currentPage: page
            });
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
});

// Endpoint untuk menyimpan folder baru
app.post('/folders', isAuthenticated, async (req, res) => {
    try {
        const { folderName, description } = req.body;
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Tambahkan folder ke daftar folder pengguna
        user.folders.push({ name: folderName, desc: description });
        await user.save();

        // Kirim respons sukses
        res.status(201).json({ message: 'Folder created successfully', folder: user.folders[user.folders.length - 1] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/addToFolder', isAuthenticated, async (req, res) => {
    try {
        const { recipeId, folders } = req.body;
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Perbarui setiap folder yang dipilih dengan menambahkan recipeId ke dalam array recipes
        for (const folderId of folders) {
            const folder = user.folders.find(folder => folder._id == folderId);
            if (folder) {
                folder.recipes.addToSet(recipeId);
            }
        }

        // Simpan perubahan pada pengguna
        await user.save();

        // Kirim respons sukses
        res.status(200).json({ message: 'Recipe added to folder(s) successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/folder/:folderId', isAuthenticated, async (req, res) => {
    try {
        const folderId = req.params.folderId;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        const resep = await Recipes.find();
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        const folders = user.folders;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folder = user.folders.find(folder => folder._id.toString() === folderId);
        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        // Dapatkan detail resep yang terkait dengan folder
        const recipeIds = folder.recipes;
        const recipes = await Recipes.find({ _id: { $in: recipeIds } });

        // Hitung jumlah total halaman
        const totalPages = Math.ceil(recipes.length / limit);

        // Ambil resep untuk halaman saat ini menggunakan skip dan limit
        const paginatedRecipes = recipes.slice(skip, skip + limit);

        // Kirimkan detail folder dan resep ke tampilan
        res.render('folder', {
            selectedFolder: folder,
            resep: resep,
            folders: folders,
            title: folder.name,
            recipes: paginatedRecipes,
            layout: "mainlayout",
            user: req.userData,
            isAdmin: req.user.isAdmin,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint untuk menyimpan perubahan pada folder ke MongoDB
app.put('/folder/:folderId', isAuthenticated, async (req, res) => {
    try {
        const folderId = req.params.folderId;
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folderIndex = user.folders.findIndex(folder => folder._id.toString() === folderId);
        if (folderIndex === -1) {
            return res.status(404).send("Folder not found");
        }

        // Update data folder dengan data yang dikirimkan dari client
        user.folders[folderIndex].name = req.body.folderName || user.folders[folderIndex].name;
        user.folders[folderIndex].desc = req.body.description || user.folders[folderIndex].description;

        // Simpan perubahan ke MongoDB
        await user.save();

        res.json({ message: 'Folder updated successfully' });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint untuk menghapus folder dari MongoDB
app.delete('/folder/:folderId', isAuthenticated, async (req, res) => {
    try {
        const folderId = req.params.folderId;
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folderIndex = user.folders.findIndex(folder => folder._id.toString() === folderId);
        if (folderIndex === -1) {
            return res.status(404).send("Folder not found");
        }

        // Hapus folder dari daftar folder pengguna
        user.folders.splice(folderIndex, 1);

        // Simpan perubahan ke MongoDB
        await user.save();

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/removeFromFolder', isAuthenticated, async (req, res) => {
    try {
        const { recipeId, folderId } = req.body;
        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        // Temukan pengguna berdasarkan ID
        let user;
        if (req.user.googleId) {
            user = await User.findById(userId);
        } else {
            user = await LocalUser.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Temukan folder yang sesuai dengan ID
        const folder = user.folders.find(folder => folder._id == folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Hapus recipeId dari array recipes di folder
        folder.recipes.pull(recipeId);

        // Simpan perubahan
        await user.save();

        // Kirim respons sukses
        res.status(200).json({ message: 'Recipe removed from folder successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/dashboard', async(req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('dashboard', {
            recipes: recipes, 
            title: 'Dashboard', 
            layout: "mainlayout",
            user: req.userData,
            isAdmin: req.user.isAdmin,
        });
        } else {
            res.status(404).send("Recipe not found")
        }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
    });

    app.delete('/deleteRecipe/:recipeID', async (req, res) => {
        try {
            // Ambil ID resep dari parameter route
            const recipeID = req.params.recipeID;
    
            // Lakukan operasi penghapusan resep di database (contoh: menggunakan model Recipes)
            await Recipes.findOneAndDelete({recipeID: recipeID});
    
            // Kirim respon yang berhasil
            req.flash('deletedMsg','Recipe deleted successfully');
            res.status(200).end();
        } catch (error) {
            // Tangani kesalahan jika terjadi
            console.error('Error deleting recipe:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

app.get('/addRecipe', async(req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('addRecipe', {
            recipes: recipes, 
            title: 'Add new Recipe', 
            layout: "mainlayout", 
            user: req.userData,
            isAdmin: req.user.isAdmin,
        });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

const storageRecipe = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public/img')) // Menentukan direktori penyimpanan file
    },
    filename: function (req, file, cb) {
        const name = file.originalname;
        cb(null, name) // Menentukan nama file yang diunggah
    }
});

// Inisialisasi multer dengan konfigurasi penyimpanan
const uploadRecipe = multer({ storage: storageRecipe });
    

    app.post('/addRecipe', uploadRecipe.single('img') , async (req, res) => {
        try {

            if (!req.file) {
                return res.status(400).send("No image uploaded");
            }
            
            const lastRecipe = await Recipes.findOne().sort({ recipeID: -1 });

        let recipeID;

        if (lastRecipe) {
            // Jika ada recipe terakhir, tambahkan 1 ke recipeID terakhir
            recipeID = lastRecipe.recipeID + 1;
        } else {
            // Jika tidak ada recipe, set recipeID menjadi 1
            recipeID = 1;
        }
            const {
                title,
                category,
                nationality,
                featured,
                desc,
                serving,
                length,
                minutes,
                calories,
                bahan,
                cara 
            } = req.body;

            const img = '/img/' + req.file.filename;

            const time = minutes + ' Minutes';

            const newRecipe = new Recipes({
                recipeID,
                title,
                category,
                nationality,
                featured,
                img,
                desc,
                serving,
                length,
                time,
                minutes,
                calories,
                bahan,
                cara
            });
            await newRecipe.save();
            req.flash('successAddMsg', 'Recipe Added')
            res.status(200).redirect('/dashboard/')
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    })

    app.get('/editRecipe/:recipeID', isAuthenticated, async (req, res) => {
        try {
            const recipeID = req.params.recipeID
            // const resep = await Recipes.find()
            const recipes = await Recipes.findOne({ recipeID })
            if (recipes) {
                res.render('editRecipe', {
                    // resep: resep,
                    recipes: recipes ,
                    user: req.userData,
                    isAdmin: req.user.isAdmin,
                    title: 'Edit Recipe' + ` ${recipes.title}`, 
                    layout: "mainlayout"})
            } else {
                res.status(404).send("Recipe not found")
            }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
    })

    app.post('/editRecipe/:recipeID', uploadRecipe.single('img') , async (req, res) => {
        try {
            const { recipeID } = req.params;

            // Temukan resep yang akan diupdate
            const existingRecipe = await Recipes.findOne({recipeID});

            if (!existingRecipe) {
                return res.status(404).send("Recipe not found");
            }

            // Persiapan data pembaruan resep
            const updatedRecipeData = {};

            // Periksa perubahan untuk setiap bidang
            if (req.body.title && req.body.title !== existingRecipe.title) {
                updatedRecipeData.title = req.body.title;
            }
            if (req.body.category && req.body.category !== existingRecipe.category) {
                updatedRecipeData.category = req.body.category;
            }
            if (req.body.nationality && req.body.nationality !== existingRecipe.nationality) {
                updatedRecipeData.nationality = req.body.nationality;
            }
            if (req.body.featured && req.body.featured !== existingRecipe.featured) {
                updatedRecipeData.featured = req.body.featured;
            }
            if (req.body.desc && req.body.desc !== existingRecipe.desc) {
                updatedRecipeData.desc = req.body.desc;
            }
            if (req.body.serving && req.body.serving !== existingRecipe.serving) {
                updatedRecipeData.serving = req.body.serving;
            }
            if (req.body.length && req.body.length !== existingRecipe.length) {
                updatedRecipeData.length = req.body.length;
            }
            if (req.body.minutes && req.body.minutes !== existingRecipe.minutes) {
                updatedRecipeData.minutes = req.body.minutes;
            }
            if (req.body.calories && req.body.calories !== existingRecipe.calories) {
                updatedRecipeData.calories = req.body.calories;
            }
            // Temukan bahan yang ditambahkan
            const addedBahan = req.body.bahan.filter(bahan => !existingRecipe.bahan.includes(bahan));
            // Temukan bahan yang dihapus
            const removedBahan = existingRecipe.bahan.filter(bahan => !req.body.bahan.includes(bahan));

            // Sama seperti untuk langkah, temukan langkah yang ditambahkan dan dihapus
            const addedCara = req.body.cara.filter(cara => !existingRecipe.cara.includes(cara));
            const removedCara = existingRecipe.cara.filter(cara => !req.body.cara.includes(cara));

            // Perbarui data resep di MongoDB untuk menambah dan menghapus bahan yang sesuai
            if (addedBahan.length > 0) {
                await Recipes.findOneAndUpdate({ recipeID }, { $push: { bahan: { $each: addedBahan } } });
            }
            if (removedBahan.length > 0) {
                await Recipes.findOneAndUpdate({ recipeID }, { $pull: { bahan: { $in: removedBahan } } });
            }

            // Perbarui data resep di MongoDB untuk menambah dan menghapus cara yang sesuai
            if (addedCara.length > 0) {
                await Recipes.findOneAndUpdate({ recipeID }, { $push: { cara: { $each: addedCara } } });
            }
            if (removedCara.length > 0) {
                await Recipes.findOneAndUpdate({ recipeID }, { $pull: { cara: { $in: removedCara } } });
            }

            const newTime = req.body.minutes + ' Minutes';
            if (newTime !== existingRecipe.time) {
                updatedRecipeData.time = newTime;
            }

            if (req.file) {
                updatedRecipeData.img = '/img/' + req.file.filename;
            }

            // Jika ada perubahan yang harus dilakukan, lakukan pembaruan
        if (Object.keys(updatedRecipeData).length > 0) {
            const updatedRecipe = await Recipes.findOneAndUpdate({recipeID}, updatedRecipeData, { new: true });
            res.status(200).end()
        } else {
            req.flash('noChangeMsg','No changes to update');
        }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    })

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
