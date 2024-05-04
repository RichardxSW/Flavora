const router = require("express").Router();
const passport = require("passport");
const User = require("../models/userModel");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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

//google 
router.get("/google", 
  passport.authenticate("google", { scope: ['email','profile'], prompt: 'select_account'})
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