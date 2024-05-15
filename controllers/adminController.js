const groupsList = require('../models/groups');
const eventsList = require('../models/events');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.adminPanel = async (req, res) => {
    //const groupsList = await groups.findAll({ where: { userId: req.user.id }});

    // consultas
    const queries = [];
    queries.push( groupsList.findAll({ where: { userId: req.user.id }}) ) ;
    queries.push( eventsList.findAll({ where : { userId : req.user.id,
        date : { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") }
    },
        order: [
            ['date', 'ASC'],
            ['time', 'ASC'] 
        ]
    }) ) ;
    queries.push( eventsList.findAll({ where : { userId : req.user.id, 
        date : { [Op.lt] : moment(new Date()).format("YYYY-MM-DD") }
    }}) );


    // array destructuring
    const [groups, events, previous] = await Promise.all(queries);
    
    res.render('admin', {
        pageName : 'Panel de Administración', 
        groups,
        events,
        previous,
        moment
    })
}