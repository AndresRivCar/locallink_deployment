const events = require('../../models/events');
const groups = require('../../models/groups');
const users = require('../../models/users');
const categories = require('../../models/categories');
const comments = require('../../models/comments');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

exports.showEvent = async (req, res) => {
    const event = await events.findOne({ 
        where : {
            slug : req.params.slug          
        }, 
        include : [
            { 
                model: groups
            }, 
            {
                model : users,
                attributes : ['id', 'name', 'image']
            }
        ]
    });

    // Si no existe
    if(!event) {
        res.redirect('/');
    }

    // Consultar por eventos cercanos
    const location = sequelize.literal(`st_geomfromtext( 'POINT( ${event.location.coordinates[0]} ${event.location.coordinates[1]} )' )`);

    // ST_DISTANCE_Sphere = Retorna una linea en metros
    const distance = sequelize.fn('st_distancesphere', sequelize.col('location'), location);

    // encontrar eventos cercanos
    const nearby = await events.findAll({
        order: distance, // los ordena del mas cercano al lejano
        where : sequelize.where(distance, { [Op.lte] : 2000 } ), // 2000 metros o 2km
        limit: 3, // maximo 3
        offset: 1, 
        include : [
            { 
                model: groups
            }, 
            {
                model : users,
                attributes : ['id', 'name', 'image']
            }
        ]
    })

    // Consultar después de verificar que existe el evento
    const eventComments = await comments.findAll({
            where: { eventId : event.id }, 
            include : [
                { 
                    model : users,
                    attributes : ['id', 'name', 'image']
                }
            ]
    })


    // pasar el resultado hacia la vista
    res.render('show-event', {
        pageName : event.title,
        event,
        eventComments, 
        nearby,
        moment
    })
}

// Confirma o cancela si el usuario asistirá al evento
exports.confirmAssistance = async (req, res) => {
    const { action } = req.body;

    if(action === 'confirm') {
        // agregar el usuario
        events.update(
            {'attendees' :  sequelize.fn('array_append', sequelize.col('attendees'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        // mensaje
         res.send('Has confirmado tu asistencia');
    } else {
        // cancelar la asistencia
        events.update(
            {'attendees' :  sequelize.fn('array_remove', sequelize.col('attendees'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
        );
        // mensaje
        res.send('Has cancelado tu asistencia');
    }
}

// muestra el listado de asistentes
exports.showAttendees = async (req, res) => {
    const event = await events.findOne({
                                    where: { slug : req.params.slug },
                                    attributes: ['attendees']
    });

    // extraer interesados
    const { attendees } = event;

    const assistants = await users.findAll({
        attributes: ['name', 'image'],
        where : { id : attendees }
    });

    // crear la vista y pasar datos
    res.render('attendees-event', {
        pageName : 'Listado Asistentes Evento',
        assistants
    })
}

// Muestra los eventos agrupados por categoria
exports.showEventsCategory = async (req, res, next) => {
    const category = await categories.findOne({ 
                                    attributes: ['id', 'name'],
                                    where: { slug : req.params.category}
    });
    const eventsList = await events.findAll({
                                    order: [
                                        ['date', 'ASC'], 
                                        ['time', 'ASC']
                                    ],
                                    include: [
                                        {
                                            model: groups,
                                            where : { categoryId : category.id}
                                        }, 
                                        {
                                            model : users
                                        }
                                    ]
    });

    res.render('category', {
        pageName : `Categoria: ${category.name}`,
        eventsList,
        moment
    })
}