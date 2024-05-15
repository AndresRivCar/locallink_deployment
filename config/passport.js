const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const users = require('../models/users');

passport.use(new localStrategy({
        usernameField : 'email',
        passwordField : 'password',
    }, 
    async (email, password, next) => {
        // This code is executed when filling out the form
        const user = await users.findOne({ 
            where : { email, active : 1 }
        });

        // Check if it exists or not
        if(!user) return next(null, false, {
            message : 'El usuario no existe'
        });
        
        // The user exists, compare his password
        const checkPass = user.validatePassword(password);

        // If the password is incorrect
        if(!checkPass) return next(null, false, {
            message : 'Contraseña Incorrecta'
        });

        return next(null, user);
    }

));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);
});

module.exports = passport;