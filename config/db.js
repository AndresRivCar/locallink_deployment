const sequelize = require('sequelize');
require('dotenv').config({path: 'variables.env'});

// si falla probar con segundo parametro usuario postgres y segundo parametro pass 1234
module.exports = new sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    //loggin: false
}); 
