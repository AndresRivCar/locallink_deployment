const usersModel = require('../../models/users');
const groupsModel = require('../../models/groups')


exports.showUser = async (req, res, next) => {
    const queries = [];

    // consultas al mismo tiempo
    queries.push( usersModel.findOne({ where : { id : req.params.id }}));
    queries.push( groupsModel.findAll({ where : { userId : req.params.id }}) );

    const [user, groups] = await Promise.all(queries);

    if(!user) {
        res.redirect('/');
        return next();
    }

    // mostrar la vista
    res.render('show-profile', {
        pageName : `Perfil Usuario: ${user.name}`,
        user,
        groups
    })
}