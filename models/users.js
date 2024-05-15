const sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const users = db.define('users', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: sequelize.STRING(60),
    image: sequelize.STRING(60),
    description: sequelize.TEXT,
    preferences: {
        type: sequelize.ARRAY(sequelize.STRING),
        defaultValue: [],
        allowNull: true // Opcional, dependiendo de tus requisitos
    },
    email: {
        type: sequelize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: { 
                msg: 'Agrega un correo electrónico válido.'
            }
        },
        unique: {
            args: true,
            msg: "Este correo ya existe en la base de datos."
        }
    },
    password:{
        type: sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: { 
                msg: 'La contraseña no puede estar vacía.'
            }
        }
    },
    active: {
        type: sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: sequelize.STRING,
    tokenExpiration: sequelize.DATE
}, {
    hooks: {
        beforeCreate(user) {
            user.password = users.prototype.hashPassword(user.password);
        }
    }
})

// Method for comparing passwords
users.prototype.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}
users.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null );
}


module.exports = users;