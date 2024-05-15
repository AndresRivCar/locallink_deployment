const sequelize = require('sequelize');
const db = require('../config/db');
const users = require('./users');
const events = require('./events');

const comments = db.define('comments', {
    id: {
        type: sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    message : sequelize.TEXT
}, {
    timestamps : false
});

comments.belongsTo(users);
comments.belongsTo(events);

module.exports = comments;