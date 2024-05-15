const sequelize = require('sequelize');
const db = require('../config/db');
//const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');
const categories = require('./categories');
const users = require('./users');

const groups = db.define('groups', {
    id: {
        type: sequelize.UUID,
        primaryKey: true,
        allowNull: false
    }, 
    name: {
        type: sequelize.TEXT(100), 
        allowNull: false, 
        validate: {
            notEmpty: {
                msg : 'El grupo debe tener un nombre'
            }
        }
    }, 
    description: {
        type: sequelize.TEXT,
        allowNull: false, 
        validate : {
            notEmpty: {
                msg: 'El grupo debe tener una descripción'
            }
        }
    },
    url: sequelize.TEXT, 
    image: sequelize.TEXT
})

groups.belongsTo(categories);
groups.belongsTo(users);

module.exports = groups;