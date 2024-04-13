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

app.get('/', (req, res) => {
    res.render('login.ejs', {title: 'Login', layout: "accountlayout"});
});


function isLoggedIn(req,res,next){
    req.user? next(): res.sendStatus(401);
}

app.delete('/', isLoggedIn, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
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
    const localuser = new LocalUser({ 
        email : req.body.email,
        username: req.body.username, 
        password: req.body.password,
        profilePicture: 'profilepic.jpg'});
    try {
      await localuser.save();
      res.redirect('/local');
    } catch (error){
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
            let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
            if (!req.user) {
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
    
            res.render('index', {
                recipes: recipes, 
                user: userData,
                title: 'Home', 
                layout: "mainlayout"
            });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error");
    }
})

app.get('/search', isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
            if (!req.user) {
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
                user: userData,
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
            let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
            if (!req.user) {
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
            res.render('detail', {
                resep: resep,
                recipes: recipes ,
                relatedRecipes: relatedRecipes, 
                user: userData,
                title: 'Detail', 
                layout: "mainlayout"})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

app.post('/detail/:recipeID', async (req, res) => {
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

app.get('/recent' ,async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            let name = '';
            let pic = '';
            if (req.user) { 
                if (req.user.username) { 
                    name = req.user.username || ''; 
                    pic = '/img/profilepic.jpg'; 
                } else {
                    name = req.user.displayName || '';
                    pic = req.user.profilePicture || '';
                }
            }
            res.render('recent', {
            recipes: recipes, 
            title: 'Recent',  
            name: name, 
            pic: pic, 
            layout: "mainlayout"});
        } else {
            res.status(404).send("Recipe not found")
        }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
    });

// app.get('/pinned', async(req, res) => {
//     try {
//         const recipes = await Recipes.find();
//         if (recipes) {
//             let name = '';
//             let pic = '';
//             if (req.user) { 
//                 if (req.user.username) { 
//                     name = req.user.username || ''; 
//                     pic = '/img/profilepic.jpg'; 
//                 } else {
//                     name = req.user.displayName || '';
//                     pic = req.user.profilePicture || '';
//                 }
//             }
//             res.render('pinned', {
//             recipes: recipes, 
//             title: 'Pinned', 
//             layout: "mainlayout", 
//             name: name, 
//             pic: pic,
// });
//         } else {
//             res.status(404).send("Recipe not found")
//         }
//         } catch (error) { 
//             res.status(500).send("Internal Server Error")
//         }
//     });

app.post('/save-recipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);

        if (user) {
                user.savedRecipes.addToSet(recipeId);
                // Set isPinned resep menjadi true
                await Recipes.findByIdAndUpdate(recipeId, { isPinned: true });
                await user.save();

                // Kirim savedRecipes yang diperbarui ke klien
                const updatedUser = await LocalUser.findById(userId).populate('savedRecipes');
                res.status(200).json({ message: 'Recipe pinned successfully', savedRecipes: updatedUser.savedRecipes });
            
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/delete-recipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Find the user by ID
        const user = await LocalUser.findById(userId);

        if (user) {
                user.savedRecipes.pull(recipeId);
                await Recipes.findByIdAndUpdate(recipeId, { isPinned: false });
                await user.save();
                res.status(200).json({ message: 'Recipe unpinned successfully' });
           
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
       res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/pinned', async (req, res) => {
    try {
        // Ambil ID pengguna dari req.user
        const userId = req.user._id;

        // Ambil data pengguna termasuk savedRecipes
        const user = await LocalUser.findById(userId).populate('savedRecipes');

        if (user) {
            // Ambil daftar resep yang disimpan oleh pengguna
            const savedRecipes = user.savedRecipes;

            // Ambil semua resep
            const allRecipes = await Recipes.find();

            // Tandai resep yang disimpan oleh pengguna dengan isPinned: true
            const recipes = allRecipes.map(recipe => {
                const isPinned = savedRecipes.some(savedRecipe => savedRecipe.equals(recipe._id));
                return {
                    ...recipe._doc,
                    isPinned: isPinned
                };
            });

            res.render('pinned', {
                savedRecipes: savedRecipes,
                recipes: recipes,
                title: 'Pinned',
                layout: "mainlayout",
                name: req.user.username || req.user.displayName || '', 
                pic: req.user.profilePicture || '/img/profilepic.jpg', 
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
