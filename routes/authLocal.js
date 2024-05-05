const LocalUser = require("../models/localuserModel");
const LocalStrategy = require('passport-local').Strategy;
const router = require("express").Router();
const passport = require("passport");
const bcrypt = require('bcrypt');

//auth local user
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await LocalUser.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email' });
        }

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (passwordMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password' });
        }
    } catch (error) {
        return done(error);
    }
}));

  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(async function(id, done) {
    try {
      const user = await LocalUser.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  module.exports = router