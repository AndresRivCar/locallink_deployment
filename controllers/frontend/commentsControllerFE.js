const comments = require('../../models/comments');
const events = require('../../models/events');

exports.addComment = async (req, res, next) => {
    // obtener el comentario
    const { comment } = req.body;

    // crear comentario en la BD
    await comments.create({
        message : comment,
        userId : req.user.id,
        eventId : req.params.id
    });

    // Redireccionar a la misma pagina
    res.redirect('back');
    next();
}

// elimina un comentario de la base de datos
exports.deleteComment = async (req, res, next ) => {

    // Tomar el ID del comentario
    const { commentId } = req.body;

    // Consultar el Comentario
    const comment = await comments.findOne({ where : { id : commentId }});

    // verificar si existe el comentario
    if(!comment) {
        res.status(404).send('Acción no válida');
        return next();
    }

    // consultar el evento del comentario
    const event = await events.findOne({ where : { id : comment.eventId }});

    // verificiar que quien lo borra sea el creador
    if(comment.userId === req.user.id || event.userId === req.user.id ){
        await comments.destroy({ where: {
            id : comment.id
        }});
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Acción no válida');
        return next();
    }

}