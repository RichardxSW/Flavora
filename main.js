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
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts); 
app.use(express.json());
app.use(morgan('dev'));
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
app.use(flash());
app.use("/auth", authGoogle);
app.use("/auth", authLocal);

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
        res.sendStatus(200);
        // res.redirect('/'); 
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
        password: req.body.password });
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
        if (req.user) { // Jika pengguna telah login
            if (req.user.username) { 
                name = req.user.username || ''; 
                pic = '/img/profilepic.jpg'; 
                email = req.user.email || '';
                password = maskPassword(req.user.password || '');
                _id = req.user._id;
            } else {
                name = req.user.displayName || '';
                pic = req.user.profilePicture || '';
                email = req.user.email || '';
                password = maskPassword(req.user.password || '');
                _id = req.user._id;
            }
        }
        res.render('profile', {
            name: name, 
            pic: pic, 
            email: email,
            password: password,
            _id: _id,
            title: 'Profile', 
            layout: "accountLayout"})
});

function maskPassword(password) {
    return '*'.repeat(password.length);
}

app.get('/edit', isAuthenticated, async(req, res) => {
    try {
        const id = req.user._id;
        const userData = await User.findById(id);

        if(userData){
            res.render('edit', {
                user: userData,
                title: 'Edit', 
                layout: "accountLayout"});
        }
        else{
            res.redirect('/profile');
        }
    } catch (error) {
        console.log(error.message);
    }
});

app.get('/home', isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            let name = '';
            let pic = '';
            if (req.user) { // Jika pengguna telah login
                if (req.user.username) { 
                    name = req.user.username || ''; 
                    pic = '/img/profilepic.jpg'; 
                } else {
                    name = req.user.displayName || '';
                    pic = req.user.profilePicture || '';
                }
            }
    
            res.render('index', {
                recipes: recipes, 
                name: name, // Nama pengguna
                pic: pic, // URL gambar profil
                title: 'Home', 
                layout: "mainlayout"
            });
        } else {
            res.status(404).send("Recipe not found");
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error");
    }
});

app.get('/detail/:recipeID', async (req, res) => {
    try {
        const recipeID = req.params.recipeID
        const recipes = await Recipes.findOne({ recipeID })
        const relatedRecipes = await Recipes.find({ category: recipes.category, _id: { $ne: recipes._id } });
        if (recipes) {
            let name = '';
            let pic = '';
            if (req.user) { // Jika pengguna telah login
                if (req.user.username) { 
                    name = req.user.username || ''; 
                    pic = '/img/profilepic.jpg'; 
                } else {
                    name = req.user.displayName || '';
                    pic = req.user.profilePicture || '';
                }
            }
            res.render('detail', {
                recipes: recipes ,
                relatedRecipes: relatedRecipes, 
                name: name, 
                pic: pic, 
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

app.get('/recent', (req, res) => {
    res.render('recent', {
        title: 'Recent', 
        layout: "mainlayout", 
        name: req.user.displayName, 
        pic: req.user.profilePicture, 
        title: 'Detail', 
        layout: "mainlayout"});
});

app.get('/pinned', (req, res) => {
    res.render('pinned', {
        title: 'Pinned', 
        layout: "mainlayout", 
        name: req.user.displayName, 
        pic: req.user.profilePicture,
        title: 'Detail', 
        layout: "mainlayout"});
});

// // Register route
// app.post("/register", async (req, res) => {
//     try {
//       const { name, photo, password } = req.body;
//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);
//       // Create new user
//       const newUser = new User({
//         name,
//         photo,
//         password: hashedPassword,
//       });
//       // Save user to database
//       await newUser.save();
//       res.status(201).json({ success: true, message: "User created successfully" });
//     } catch (error) {
//       console.error("Error registering user:", error);
//       res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   });

// app.get("/login/failed", (req, res) => {
//     res.status(401).json({
//       success: false,
//       message: "failure",
//     });
//   });
  
//   app.get("/logout", (req, res) => {
//     req.logout();
//     res.redirect(CLIENT_URL);
//   });

//   app.get("/login/success", (req, res) => {
//     if (req.user) {
//       res.status(200).json({
//         success: true,
//         message: "successfull",
//         user: req.user,
//         //   cookies: req.cookies
//       });
//     }
//   });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
