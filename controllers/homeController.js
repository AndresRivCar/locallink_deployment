const categoriesModel = require('../models/categories');
const eventsModel = require('../models/events');
const groups = require('../models/groups');
const users = require('../models/users');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 * Controller function to render the home page.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
exports.home = async (req, res) => {

    // Promise para consultas en el home
    const consultas = [];
    consultas.push( categoriesModel.findAll({}) );
    consultas.push( eventsModel.findAll ({
            attributes : ['slug', 'title', 'date', 'time'],
            where :{
                date : { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") }
            },
            limit: 3,
            order : [
                ['date', 'ASC'],
                ['time', 'ASC'] 
            ], 
            include : [
                {
                    model : groups, 
                    attributes: ['image']
                },
                {
                    model : users, 
                    attributes: ['name', 'image']
                }
            ]
    }));

    // extraer y pasar a la vista
    const [ categories, events  ] = await Promise.all(consultas);

    res.render('home', {
        pageName : 'Inicio',
        categories, 
        events, 
        moment
    })
};