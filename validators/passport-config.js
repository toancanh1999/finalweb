const LocalStrategy = require('passport-local').Strategy;
var users = {};
function initialize(passport) {
    const authenticateUser = (req, username, password, done) => {
        req.app.db.collection("users").findOne({
            "username" : username
        },function(err,user){
            users = user;
            if(err) return done(err)

            if(!user) return done(null, false, req.flash('message', 'User not found'))

            if(user.password !== password) {
                return done(null, false, req.flash('message', 'Invalid password'))
            }

            return done(null, user);
        });
    }

    passport.use(new LocalStrategy( {passReqToCallback: true, usernameField: 'username'}, authenticateUser))

    passport.serializeUser((user, done) => {
        return done(null, user)
    })

    passport.deserializeUser((user, done) => {
            done(null, user);
    })
}

module.exports = initialize