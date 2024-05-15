const groupsList = require('../models/groups');
const events = require('../models/events');
const { v4: uuid } = require('uuid');

// Muestra el formulario para nuevos Meeti
exports.formCreateEvent = async (req, res) => {
    const groups = await groupsList.findAll({ where : { userId : req.user.id }});

    res.render('new-event', {
        pageName : 'Crear Nuevo Evento',
        groups
    })
}

// Inserta nuevos eventos en la BD
exports.createEvent = async (req, res) => {
    // obtener los datos
    const event = req.body;

    // Check if groupId is present and not empty
    if (!event.groupId) {
        req.flash('error', 'Debe seleccionar un grupo válido');
        return res.redirect('/new-event');
    }

    // asignar el usuario
    event.userId = req.user.id;
    
    // almacena la ubicación con un point
    const point = { type : 'Point', coordinates : [ parseFloat(req.body.lat), parseFloat(req.body.lng) ] };
    event.location = point;

    // cupo opcional
    if(req.body.capacity === '') {
        event.capacity = 0;
    }

    event.id = uuid();

    // almacenar en la BD
    try {
        await events.create(event);
        req.flash('exito', 'Se ha creado el evento correctamente');
        res.redirect('/admin');
    } catch (error) {
        // extraer el message de los errores
        console.error(error);
        const errorsSequelize = error.errors.map(err => err.message);
        req.flash('error', errorsSequelize);
        res.redirect('/new-event');
    }

}

// sanitiza los meeti
exports.sanitizeEvent = (req, res, next) => {
    req.sanitizeBody('title');
    req.sanitizeBody('guest');
    req.sanitizeBody('capacity');
    req.sanitizeBody('date');
    req.sanitizeBody('time');
    req.sanitizeBody('address');
    req.sanitizeBody('city');
    req.sanitizeBody('state');
    req.sanitizeBody('country');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('groupId');

    next();
}


// Muestra el formulario para editar un evento
exports.formEditvent = async (req, res, next) => {
    const queries = [];
    queries.push( groupsList.findAll({ where : { userId : req.user.id }}) );
    queries.push( events.findByPk(req.params.id) );

    // return un promise
    const [ groups, event ] = await Promise.all(queries);

    if(!groups || !event ){
        req.flash('error', 'Operación no valida');
        res.redirect('/admin');
        return next();
    }

    // mostramos la vista
    res.render('edit-event', {
        pageName : `Editar Evento : ${event.title}`,
        groups, 
        event
    })

}

// almacena los cambios en el meeti (BD)
exports.editEvent = async (req, res, next) => {
    const event = await events.findOne({ where : { id: req.params.id, userId : req.user.id }});

    if(!event) {
        req.flash('error', 'Operación no valida');
        res.redirect('/admin');
        return next();
    }

    // asignar los valores
    const { ggroupId, title, guest, date, time, capacity, description, address, city, state, country, lat, lng } = req.body; 

    event.ggroupId = ggroupId;
    event.title = title;
    event.guest = guest;
    event.date = date;
    event.time = time;
    event.capacity = capacity;
    event.description = description;
    event.address = address;
    event.city = city;
    event.state = state;
    event.country = country;

    // asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    event.location = point;

    // almacenar en la BD
    await event.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/admin');

}

// muestra un formulario para eliminar meeti's
exports.formDeletEvent = async ( req, res, next) => {
    const event = await events.findOne({ where : { id : req.params.id, userId : req.user.id }});

    if(!event) {
        req.flash('error', 'Operación no valida');
        res.redirect('/admin');
        return next();
    }

    // mostrar la vista
    res.render('delete-event', {
        pageName : `Eliminar Evento : ${event.title}`
    })
}

// Elimina el Meeti de la BD
exports.deleteEvent = async (req, res) => {
    await events.destroy({
        where: {
            id: req.params.id
        }
    });

    req.flash('exito', 'Evento Eliminado');
    res.redirect('/admin');

}