const {Router} = require('express');
const accRouter = Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalUser = require("./models/localuserModel");

//Route to redirect to login page
accRouter.get('/', (req, res) => {
    res.render('login.ejs', {
        title: 'Login', 
        layout: "accountlayout"
    });
});

//Route to redirect to register page
accRouter.get('/register', (req, res) => {
    res.render('regis.ejs', {
        title: 'Register',
        layout: "accountlayout"
    });
});

//Route to handle user registration
accRouter.post('/register', async (req, res) => {
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

//Route to redirect to email login page
app.get('/local', (req, res) => {
    res.render('loginEmail.ejs', {
        title: 'Login', 
        layout: "accountlayout",
    });
    req.flash('error','incorrect login')
});

//Route to redirect to home page after successful login with email
app.post('/local', passport.authenticate('local',{
    successRedirect: '/home',
    failureRedirect: '/local',
    failureFlash: true
}));

module.exports = accRouter;