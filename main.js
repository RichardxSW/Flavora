const express = require('express');
const app = express();
const port = 3000;
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth")
const expressLayouts = require("express-ejs-layouts");
const cookieSession = require("cookie-session");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts); 

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

app.get('/', (req, res) => {
    res.render('login.ejs', {title: 'Login', layout: "accountlayout"});
});

app.get('/register', (req, res) => {
    res.render('regis.ejs', {title: 'Register', layout: "accountlayout"});
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/home",
      failureRedirect: "/login/failed",
    })
  );

app.get('/home', (req, res) => {
    res.render('index',  {title: 'Home', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.get('/detail', (req, res) => {
    res.render('detail', {title: 'Detail', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.get('/recent', (req, res) => {
    res.render('recent', {title: 'Recent', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.get('/pinned', (req, res) => {
    res.render('pinned', {title: 'Pinned', layout: "mainlayout", name: req.user.displayName, pic: req.user.photos[0].value});
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
