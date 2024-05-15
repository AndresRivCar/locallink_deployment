const passport = require('passport');

// Función para desencriptar el password cifrado con el cifrado mejorado
function decryptPassword(encryptedPassword) {
    var decryptedPassword = "";

    for (var i = 0; i < encryptedPassword.length; i++) {
        var charCode = encryptedPassword.charCodeAt(i);
        // Restamos el mismo desplazamiento que usamos en la encriptación
        charCode = charCode - (i * encryptedPassword.length + i + 1);
        decryptedPassword += String.fromCharCode(charCode);
    }

    return decryptedPassword;
}


// Middleware para autenticar al usuario
exports.authenticateUser = (req, res, next) => {
    console.log(req.body.password);
    // Verificar si existe un password en el cuerpo de la solicitud y desencriptarlo si es necesario
    if (req.body && req.body.password) {
        var encryptedPassword = req.body.password;
        var decryptedPassword = decryptPassword(encryptedPassword);
        req.body.password = decryptedPassword;
    }

    // Autenticar al usuario utilizando Passport
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true,
        badRequestMessage: 'Ambos campos son obligatorios'
    })(req, res, next);
};

// check if the user is authenticated or not
exports.authenticatedUser = (req, res, next) => {
    // If the user is authenticated, go ahead
    if(req.isAuthenticated() ) {
        return next();
    }

    // if not authenticated
    return res.redirect('/login');
}

// Sign off
exports.signOff = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('correcto', 'Cerraste sesión correctamente');
        res.redirect('/login');
        next();
    });
    
}