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
const Recipes = require('./models/recipesModel');
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
    .then(() => console.log(`MongoDB connected at ${MONGO_URL}`))
    .catch(err => console.log(err))

app.use(
    cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
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

app.get('/register', (req, res) => {
    res.render('regis.ejs', {title: 'Register', layout: "accountlayout"});
});

app.get('/home', async (req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('index', {recipes: recipes , title: 'Home', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value })
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

// app.get('/detail', (req, res) => {
//     res.render('detail', {title: 'Detail', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
// });

app.get('/detail/:recipeID', async (req, res) => {
    try {
        const recipeID = req.params.recipeID
        const recipes = await Recipes.findOne({ recipeID })
        if (recipes) {
            res.render('detail', {recipes , title: 'Detail', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

// app.get('/search/:recipeID', async (req, res) => {
//     try {
//         const recipeID = req.params.recipeID
//         const recipes = await Recipes.findOne({ recipeID })
//         if (recipes) {
//             res.render('detail', {recipes , title: 'Detail', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value})
//         } else {
//             res.status(404).send("Recipe not found")
//         }
//     } catch (error) { 
//         res.status(500).send("Internal Server Error")
//     }
// })

app.get('/recent', (req, res) => {
    res.render('recent', {title: 'Recent', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.get('/pinned', (req, res) => {
    res.render('pinned', {title: 'Pinned', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
