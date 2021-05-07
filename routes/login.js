const express = require('express');
const router = express.Router();
require('dotenv').config();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const passport = require('passport');
const initializePassport = require('../validators/passport-config');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PORT } = process.env;
initializePassport(passport);
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${PORT}/login/auth/google/callback`
},
        function (accessToken, refreshToken, profile, done) {
                var new_user = profile._json
                new_user["role"] = "student";
                new_user["id"] = profile.id;
                return done(null, new_user);
        }
));

router.get('/', (req, res) => {
        if (!req.user) {
                const error = req.flash('error');
                const message = req.flash('message');
                res.render('login',{error, message});

        } else {
                res.render('index');
        }

});
router.post('/', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,successRedirect: '/home'
}));
router.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/error' }), (req, res) => {
                res.redirect('/home')
        }
);

module.exports = router