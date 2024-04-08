const express = require('express');
const app = express();
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth")
const expressLayouts = require("express-ejs-layouts");
const cookieSession = require("cookie-session");
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');
const Recipes = require('./models/recipesModel');
const User = require("./models/userModel");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const localUser = require("./models/localuserModel");
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

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoute);

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
);

app.get("/auth/google", 
  passport.authenticate("google", { scope: ['email','profile'] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "/home",
        failureRedirect: "/auth/failure",
    }),
);

app.get("/auth/failure", (req,res)=>{
    res.send("something went wrong");
})

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

// app.post('/register', async (req, res) => {
//     try {
//       const { username, email, password } = req.body;
  
//       // Validasi email menggunakan regular expression
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         req.flash("error", "Invalid email address");
//         return res.redirect("/");
//       }
  
//       // Cek apakah username sudah ada dalam database
//       const existingUser = await UserData.findOne({ username });
//       if (existingUser) {
//         req.flash("error", "Username already exists");
//         return res.redirect("/");
//       }
  
//       // Cek apakah email sudah terdaftar
//       const existingEmail = await UserData.findOne({ email });
//       if (existingEmail) {
//         req.flash("error", "Email already registered");
//         return res.redirect("/");
//       }
  
//       // Enkripsi password sebelum disimpan di database
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Simpan data pengguna baru ke dalam database
//       const newUser = new UserData({ username, email, password: hashedPassword });
//       await newUser.save();
  
//       req.flash("success", "User registered successfully! Please login.");
//       res.redirect("/");
//     } catch (error) {
//       console.error("Error registering user:", error.message);
//       req.flash("error", "Error registering user");
//     //   res.redirect("e");
//     }
//   });

app.post('/register', async (req, res) => {
    try {
      const { fullName, userName, email, phoneNum, password } = req.body;
  
      // Cek apakah username atau email sudah ada dalam database lokal
      const existingUser = await localUser.findOne({ $or: [{ userName }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists.' });
      }
  
      // Enkripsi password sebelum menyimpannya dalam database
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Buat pengguna baru
      const newUser = new localUser({
        fullName,
        userName,
        email,
        phoneNum,
        password: hashedPassword // Simpan password yang dienkripsi
      });
  
      // Simpan pengguna baru ke dalam database
      const savedUser = await newUser.save();
  
      // Kirim respons berhasil
      res.status(201).json({ message: 'User registered successfully.', user: savedUser });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

app.get('/home', async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('index', {recipes: recipes, name: req.user.displayName, pic: req.user.profilePicture , title: 'Home', layout: "mainlayout"})
            // res.render('index', {recipes: recipes, user: req.user , title: 'Home', layout: "mainlayout"})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

app.get('/search', async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('search', {recipes: recipes, name: req.user.displayName, pic: req.user.profilePicture , title: 'Search', layout: "mainlayout"})
            // res.render('index', {recipes: recipes, user: req.user , title: 'Home', layout: "mainlayout"})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

// app.put('/detail/:recipeID', async (req, res) => {
//     try {
//         const recipeId = req.body._id; // Menggunakan _id dari MongoDB untuk resep
//         const userId = req.body._id; // Menggunakan _id dari MongoDB untuk user

//         const recipe = await Recipes.findById(recipeId);
//         const user = await User.findById(userId);

//         if (!recipe || !user) {
//             return res.status(404).send("Recipe or User not found");
//         }

//         user.savedRecipes.push(recipe);
//         await user.save();

//         res.status(201).json({ savedRecipes: user.savedRecipes });
//     } catch (error) { 
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });

app.get('/detail/:recipeID', async (req, res) => {
    try {
        const recipeID = req.params.recipeID
        const recipes = await Recipes.findOne({ recipeID })
        const resep = await Recipes.find()
        if (recipes) {
            res.render('detail', {recipes: recipes ,resep: resep, name: req.user.displayName, pic: req.user.profilePicture, title: 'Detail', layout: "mainlayout"})
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

        await recipe.save();

        res.status(201).send("Review added successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/recent', async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('recent', {recipes: recipes, title: 'Recent', layout: "mainlayout", name: req.user.displayName, pic: req.user.profilePicture});
        } else {
            res.status(404).send("Recipe not found")
        }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
    });

app.get('/pinned', async(req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('pinned', {recipes: recipes, title: 'Pinned', layout: "mainlayout", name: req.user.displayName, pic: req.user.profilePicture});
        } else {
            res.status(404).send("Recipe not found")
        }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
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
