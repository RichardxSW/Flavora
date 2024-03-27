const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const GOOGLE_CLIENT_ID = "103328795113-crtgk3olggmheoqr0fnklvgrv2ak898q.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    done(null, profile)
  }
));

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
  done(null, profile)
}
));

passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });