const router = require("express").Router();
const passport = require("passport");
const User = require("../models/userModel");
const localUser = require("../models/localuserModel");
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const GOOGLE_CLIENT_ID = '103328795113-crtgk3olggmheoqr0fnklvgrv2ak898q.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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'

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true
},
async function(request, accessToken, refreshToken, profile, cb) {
    try {
        // Cek apakah pengguna sudah ada di MongoDB
        const user = await User.findOne({ googleId: profile.id });
        if (!user) {
            // Jika pengguna tidak ada, buat pengguna baru
            const newUser = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0].value // Anda dapat menyesuaikan ini sesuai dengan struktur objek profil
                // tambahkan properti lain yang ingin Anda simpan dari profil pengguna Google
            });
            // Simpan pengguna baru ke dalam MongoDB
            const savedUser = await newUser.save();
            return cb(null, savedUser);
        } else {
            // Jika pengguna sudah ada, kembalikan pengguna yang ada
            return cb(null, user);
        }
    } catch (error) {
        return cb(error);
    }
}
));

passport.use(new LocalStrategy(
  function(username, password, done) {
    localUser.findOne({ userName: username }, async function (err, user) {
      if (err) { return done(err); }
      if (user) {
        return done(null, false, { message: 'Username already exists.' });
      } else {
        try {
          const newUser = new localUser({
            fullName: req.body.fullName,
            userName: req.body.userName,
            email: req.body.email,
            phoneNum: req.body.phoneNum,
            password: req.body.password
          });
          const savedUser = await newUser.save();
          return done(null, savedUser);
        } catch (error) {
          return done(error);
        }
      }
    });
  }
));

//google 
router.get("/google", 
  passport.authenticate("google", { scope: ['email','profile'] })
);

router.get("/google/callback",
    passport.authenticate("google", {
        successRedirect: "/home",
        failureRedirect: "/auth/failure",
    }),
);

router.get("/failure", (req,res)=>{
    res.send("something went wrong");
})

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(user, done){
  done(null, user);
});

module.exports = router