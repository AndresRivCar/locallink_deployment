const users = require('../models/users');
const sendEmail = require('../handlers/emails');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

/**
 * Configuration for Multer middleware, specifying limits, storage, and file filtering.
 * 
 * @const {Object}
 * @property {Object} limits - Object specifying limits, with a fileSize limit of 100000 bytes (100 KB).
 * @property {Object} storage - Object defining the storage settings for uploaded files.
 * @property {Function} fileFilter - Function defining the file filter logic for accepted file types.
 */
const multerConfig = {
    limits : { fileSize : 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/profiles/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }), 
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            // el formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

/**
 * Multer middleware for uploading an image to the server.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const upload = multer(multerConfig).single('image');

/**
 * Middleware for handling image upload errors and flashing appropriate messages.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
exports.uploadImage = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

exports.formCreateAccount = (req, res) => {
    res.render('create-account', {
        pageName: 'Crea tu Cuenta'
    })
};

exports.createNewAccount = async(req, res) => {
    const user = req.body;

    if (!user.preferences || !Array.isArray(user.preferences)) {
        user.preferences = [];
    }

    if (user.preferences.includes('cine')) {
        user.preferences.push(...['pelicula', 'peliculas', 'estreno', 'estrenos', 'proyeccion', 'proyecciones', 'director', 'directores', 'actor', 'actores', 'actriz', 'actrices', 'guion', 'guiones', 'premio', 'premios', 'festival', 'festivales', 'pantalla grande', 'pantallas grandes', 'taquilla', 'taquillas', 'estrella', 'estrellas', 'gala', 'galas', 'palomitas', 'cineasta', 'cineastas']);
    }
    
    if (user.preferences.includes('musica')) {
        user.preferences.push(...['concierto', 'conciertos', 'festival', 'festivales', 'cancion', 'canciones', 'album', 'albums', 'artista', 'artistas', 'banda', 'bandas', 'gira', 'giras', 'escenario', 'escenarios', 'melodia', 'melodias', 'letra', 'letras', 'ritmo', 'ritmos', 'publico', 'publicos', 'musica en vivo', 'musicas en vivo', 'solista', 'solistas', 'compositor', 'compositores', 'sesiones', 'sesion', 'sessions', 'session']);
    }
    
    if (user.preferences.includes('teatro')) {
        user.preferences.push(...['obra', 'obras', 'acto', 'actos', 'escenario', 'escenarios', 'actor', 'actores', 'actriz', 'actrices', 'director', 'directores', 'ensayo', 'ensayos', 'funcion', 'funciones', 'drama', 'dramas', 'comedia', 'comedias', 'tragedia', 'tragedias', 'butacas', 'butaca', 'aplausos', 'aplauso', 'telon', 'telones', 'iluminacion', 'iluminaciones', 'vestuario', 'vestuarios']);
    }
    
    if (user.preferences.includes('conversatorios')) {
        user.preferences.push(...['charla', 'charlas', 'conferencia', 'conferencias', 'panel', 'paneles', 'ponente', 'ponentes', 'moderador', 'moderadores', 'audiencia', 'audiencias', 'debate', 'debates', 'preguntas', 'pregunta', 'respuestas', 'respuesta', 'interaccion', 'interacciones', 'tema', 'temas', 'expositor', 'expositores', 'mesa redonda', 'mesas redondas', 'coloquio', 'coloquios', 'discusion', 'discusiones', 'semillero', 'semilleros', 'recorrido', 'recorridos', 'visita', 'visitas', 'encuentro', 'encuentros']);
    }
    
    

    //console.log(user.preferences);
    //debugger;


    req.checkBody('confirm', 'El campo de repetir contraseña no puede enviarse vacío').notEmpty().trim();
    req.checkBody('confirm', 'Las contraseñas no coinciden').equals(req.body.password);

    //console.log(req.validationErrors());

    // Read express errors
    const expressErrors = req.validationErrors() || [];

    try{
        await users.create(user);

        // Generate confirmation url
        const url = `http://${req.headers.host}/confirm-account/${user.email}`;

        // Send confrimation email
        await sendEmail.sendEmail({
            user,
            url,
            subject: 'Confirma tu cuenta en Locallink para comenzar',
            template: 'confirm-account'
        })

        req.flash('exito', '¡Gracias por registrarte! Revisa tu correo y confirma tu cuenta');
        res.redirect('/login');
    } catch (error) {
        //console.log(error);
        let sequelizeErrors = [];
        if (error.name === 'SequelizeUniqueConstraintError') {
            //sequelizeErrors = "Este correo ya existe en la base de datos.";
            sequelizeErrors.push('Usuario ya registrado');
        } else {
            sequelizeErrors = error.errors.map(err => err.message);
        }

        // Extract only the msg of the errors
        const expErr = expressErrors.map(err => err.msg);
        //console.log(expErr);

        // Join messages
        const errorList = [...sequelizeErrors, ...expErr];

        req.flash('error', errorList);
        res.redirect('/create-account');
    }
};

// Confirm the user's subscription
exports.confirmAccount = async (req, res, next) => {
    const user = await users.findOne({ where : { email: req.params.email }});

    if(!user) {
        req.flash('error', 'Usuario no encontrado');
        res.redirect('/create-account');
        return next();
    }

    user.active = 1;
    user.save();
    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/login');
}

// Login form
exports.formLogin = (req, res) => {
    res.render('login', {
        pageName: 'Iniciar sesión'
    })
};

// Muestra el formulario para editar el perfil
exports.formEditProfile = async (req, res) => {
    console.log("********************");
    const user = await users.findByPk(req.user.id);

    res.render('edit-profile', {
        pageName : 'Editar Perfil',
        user
    })
}

// almacena en la Base de datos los cambios al perfil
exports.editProfile = async (req, res) => {
    const user = await users.findByPk(req.user.id);

    req.sanitizeBody('name');
    req.sanitizeBody('email');
    // leer datos del form
    const {name, description, email} = req.body;

    // asignar los valores
    user.name = name;
    user.description = description;
    user.email = email;

    // guardar en la BD
    await user.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/admin');
}

// Muestra el formulario para modificar el password
exports.formChangePassword = (req, res) => {
    res.render('change-password', {
        pageName : 'Cambiar Contraseña'
    })
}

// Revisa si el password anterior es correcto y lo modifica por uno nuevo
exports.changePassword = async (req, res, next) => {
    const user = await users.findByPk(req.user.id);

    // verificar que el password anterior sea correcto
    if(!user.validatePassword(req.body.previous)) {
        req.flash('error', 'La contraseña actual es incorrecta');
        res.redirect('/admin');
        return next();
    }

    // si  el password es correcto, hashear el nuevo
    const hash = user.hashPassword(req.body.new);

    // asignar el password al usuario
    user.password = hash;

    // guardar en la base de datos
    await user.save();

    // redireccionar
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('exito', 'Contraseña Modificado Correctamente, vuelve a iniciar sesión');
        res.redirect('/login');
    });
}

// Muestra el formulario para subir una imagen de perfil
exports.formUploadProfileImage = async (req, res) => {
    const user = await users.findByPk(req.user.id);

    // mostrar la vista
    res.render('profile-image', {
        pageName : 'Subir Imagen perfil',
        user
    });

}

// guarda la imagen nueva, elimina la anterior (si aplica) y guarda el registro en la base de datos
exports.saveProfileImage = async (req, res) => {
    const user = await users.findByPk(req.user.id);

    // si hay imagen anterior, eliminarla
    if(req.file && user.image) {
        const previousImagePath = __dirname + `/../public/uploads/profiles/${user.image}`;

        // eliminar archivo con filesystem
        fs.unlink(previousImagePath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    // almacenar la nueva imagen
    if(req.file) {
        user.image = req.file.filename;
    }

    // almacenar en la base de datos y redireccionar
    await user.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/admin');
}