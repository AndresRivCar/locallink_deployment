/**
 * Module that exports an Express router with various routes related to managing groups and their images.
 * @module routes
 * @returns {Object} Express router instance.
 * @author Andres Rivera
 */

const categoriesModel = require('../models/categories');
const groups = require('../models/groups');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const { v4: uuid } = require('uuid');

/**
 * Configuration for Multer middleware, specifying limits, storage, and file filtering.
 * 
 * @const {Object}
 * @property {Object} limits - Object specifying limits, with a fileSize limit of 100000 bytes (100 KB).
 * @property {Object} storage - Object defining the storage settings for uploaded files.
 * @property {Function} fileFilter - Function defining the file filter logic for accepted file types.
 */
const multerConfig = {
    limits : { fileSize : 200000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/groups/');
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
            } else {
                req.flash('error', 'Se produjo un error al cargar la imagen');
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

/**
 * Render the form to create a new group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves after rendering the 'new-group' view.
 */
exports.formNewGroup = async (req, res) => {
    try {
        // Fetch all categories from the database
        const categories = await categoriesModel.findAll();

        // Render the 'new-group' view with the retrieved categories
        res.render('new-group', {
            pageName: 'Crea un nuevo grupo',
            categories,
        });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error rendering new group form:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Create a new group based on the provided information.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves after creating the group and redirecting the user.
 */
exports.createGroup = async (req, res) => {
        // sanitize
        req.sanitizeBody('name');
        req.sanitizeBody('url');

        const group = req.body;

        // almacena el usuario autenticado como el creador del grupo
        group.userId = req.user.id

        // capturar la imagen
        if(req.file) {
            group.image = req.file.filename;
        }

        group.id = uuid();

    try {
        await groups.create(group);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/admin');
    } catch (error) {
        // extraer el message de los errores
        //const sequelizeErrors = error.errors.map(err => err.message);
        //req.flash('error', sequelizeErrors);
        //res.redirect('/new-group');
        console.log(error);
        let errorMessage;

        // Manejar el error de validación
        if (error.name === 'SequelizeValidationError') {
            // Array para almacenar los mensajes de error de validación
            const validationErrorMessages = error.errors.map(validationError => validationError.message);
            // Unir los mensajes de error de validación en un solo mensaje
            errorMessage = validationErrorMessages.join('\n');
        } else if (error.name === 'SequelizeDatabaseError') {
            // Manejar el error de clave externa
            errorMessage = 'Debes seleccionar una categoría válida para el grupo';
        } else {
            errorMessage = error.message || 'Hubo un error al guardar el grupo';
        }
    
        // Enviar el mensaje de error a través de flash y redirigir
        req.flash('error', errorMessage);
        res.redirect('/new-group');
    }

};

/**
 * Render the form to edit an existing group.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves after rendering the 'edit-group' view.
 */
exports.formEditGroup = async (req, res) => {
    const queries = [];
    queries.push(groups.findByPk(req.params.groupId));
    queries.push(categoriesModel.findAll());

    const [group, categories] = await Promise.all(queries);

    res.render('edit-group', {
        pageName : `Editar Grupo : ${group.name}`,
        group,
        categories
    })
}

/**
 * Edits an existing group.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
exports.editGroup = async (req, res, next) => {
    try {
        // Buscar el grupo por ID y usuario actual
        const group = await groups.findOne({
            where: {
                id: req.params.groupId,
                userId: req.user.id
            }
        });

        // Verificar si el grupo no existe o no pertenece al usuario
        if (!group) {
            req.flash('error', 'No se encontró el grupo o no tienes permisos para editarlo');
            res.redirect('/admin');
            return next();
        }

        // Leer los valores del cuerpo de la solicitud
        const { name, description, categoryId, url } = req.body;

        // Asignar los nuevos valores al grupo
        group.name = name;
        group.description = description;
        group.categoryId = categoryId;
        group.url = url;

        // Guardar los cambios en la base de datos
        await group.save();

        // Mensaje flash de éxito
        req.flash('exito', 'Cambios almacenados correctamente');
        return res.redirect('/admin');
    } catch (error) {
        console.error('Error al editar el grupo:', error);
        req.flash('error', 'Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo más tarde');
        res.redirect('/admin');
        return next();
    }
}

/**
 * Render the form to edit an image of a group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves after rendering the 'edit-image' view.
 */
exports.formEditImage = async (req, res) => {
    const group = await groups.findOne({ where: { id: req.params.groupId, userId: req.user.id } });
  
    res.render('group-image', {
        pageName: `Editar Imagen Grupo: ${group.name}`,
        group,
    });
}

/**
 * Edit the image of a group based on the provided request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves after editing the group image and redirecting the user.
 */
exports.editImage = async (req, res, next) => {
    // Find the group based on the group ID and user ID
    const group = await groups.findOne({ where : { id : req.params.groupId, userId : req.user.id }});

    // Check if the group exists and is valid
    if(!group) {
        req.flash('error', 'Operación no válida');
        res.redirect('/login');
        return next();
    }

    // Check if there is a new file
    /*if(req.file) {
        console.log(req.file.filename);
    }

    // Check if there is a previous file
    if(group.image) {
        console.log(group.image);
    }*/

    // If there is both a new and a previous image, delete the previous one
    if(req.file && group.image) {
        const previousImagePath = __dirname + `/../public/uploads/groups/${group.image}`;

        // Delete the file using the filesystem
        fs.unlink(previousImagePath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    // If there is a new image, update the group's image property
    if(req.file) {
        group.image = req.file.filename;
    }

    // Save the changes to the database
    await group.save();

    // Flash a success message and redirect to the admin page
    req.flash('exito', 'Imagen cambiada exitosamente');
    res.redirect('/admin');
}

/**
 * Render the form for deleting an existing group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves after rendering the 'delete-group' view.
 */
exports.formDeleteGroup = async (req, res, next) => {
    // Find the group by ID and current user
    const group = await groups.findOne({ where : { id : req.params.groupId, userId : req.user.id }});

    // Check if the group does not exist or does not belong to the user
    if(!group) {
        req.flash('error', 'Operación no válida');
        res.redirect('/admin');
        return next();
    }

    // Render the 'delete-group' view with the group information
    res.render('delete-group', {
        pageName : `Eliminar Grupo : ${group.name}`
    })
}

/**
 * Delete the group and its associated image based on the provided request.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves after deleting the group and associated image, and redirecting the user.
 */
exports.deleteGroup = async (req, res, next) => {
    // Find the group by ID and current user
    const group = await groups.findOne({ where : { id : req.params.groupId, userId : req.user.id }});

    // If there is an image associated with the group, delete it
    if(group.image) {
        const previousImagePath = __dirname + `/../public/uploads/groups/${group.image}`;

        // eliminar archivo con filesystem
        fs.unlink(previousImagePath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    // Delete the group from the database
    await groups.destroy({
        where: {
            id: req.params.groupId
        }
    });

    // Redirect the user with a success message
    req.flash('exito', 'Grupo eliminado exitosamente');
    res.redirect('/admin');
}