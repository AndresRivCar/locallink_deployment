const events = require('../../models/events');
const groups = require('../../models/groups');
const users = require('../../models/users');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const moment = require('moment');
const unidecode = require('unidecode');

exports.searchResults = async (req, res) => {
   
    // Leer datos de la URL 
    const { category, title, city, country } = req.query;

    // Construir la condición de búsqueda para la categoría
    let categoryCondition = {};
    if (category !== '') {
        categoryCondition = { 'categoryId': category };
    }
 
    // Filtrar los eventos por los términos de búsqueda
    const eventList = await events.findAll({ 
        where: sequelize.literal(`
            unaccent("title") ILIKE unaccent('%${title}%') AND 
            unaccent("city") ILIKE unaccent('%${city}%') AND 
            unaccent("country") ILIKE unaccent('%${country}%')
        `),
        include: [
            {
                model: groups,
                where: categoryCondition // Se aplica la condición de categoría también en la inclusión de grupos
            },
            { 
                model: users, 
                attributes : ['id',  'name', 'image']
            }
        ]
    });

    // Pasar los resultados a la vista
    res.render('search', {
        pageName : 'Resultados Búsqueda',
        eventList, 
        moment
    });
}
