const groups = require('../../models/groups');
const event = require('../../models/events');
const moment = require('moment');

exports.showGroup = async (req, res, next) => {
    const queries = [];

    queries.push( groups.findOne({ where: { id: req.params.id} }) );
    queries.push(event.findAll({
                                where: { groupId : req.params.id }, 
                                order : [
                                    ['date', 'ASC']
                                ]
    }));

    const [group, events] = await Promise.all(queries);

    // si no hay grupo
    if(!group) {
        res.redirect('/');
        return next();
    }

    // mostrar la vista
    res.render('show-group', {
        pageName : `Información Grupo: ${group.name}`,
        group,
        events,
        moment
    });
}