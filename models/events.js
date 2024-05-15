const sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');

const users = require('../models/users');
const groups = require('../models/groups');

const events = db.define(
    'events', {
        id  : {
            type: sequelize.UUID,
            primaryKey : true,
            allowNull : false
        }, 
        title : {
            type : sequelize.STRING,
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un Titulo'
                }
            }
        }, 
        slug : {
            type: sequelize.STRING,
        },
        guest : sequelize.STRING,
        capacity : {
            type: sequelize.INTEGER,
            defaultValue : 0
        },
        description : {
            type : sequelize.TEXT, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una descripción'
                }
            }
        },
        date : {
            type : sequelize.DATEONLY, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una fecha para el evento'
                }
            }
        },
        time : {
            type : sequelize.TIME, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una hora para el evento'
                }
            }
        },
        address : {
            type : sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una dirección'
                }
            }
        },
        city : {
            type : sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega una ciudad'
                }
            }
        },
        state : {
            type : sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un estado'
                }
            }
        },
        country : {
            type : sequelize.STRING, 
            allowNull : false,
            validate : {
                notEmpty : {
                    msg : 'Agrega un país'
                }
            }
        },
        location : {
            type : sequelize.GEOMETRY('POINT') 
        },
        attendees : {
            type: sequelize.ARRAY(sequelize.INTEGER),
            defaultValue : []
        }
    }, {
        hooks: {
            async beforeCreate(event) {
                const url = slug(event.title).toLowerCase();
                event.slug = `${url}-${shortid.generate()}`;
            }
        }
    } );
events.belongsTo(users);
events.belongsTo(groups);

module.exports = events;