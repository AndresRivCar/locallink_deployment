const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const router =  require('./routes');
const passport =  require('./config/passport');
const db = require('./config/db');
    require('./models/users');
    require('./models/categories');
    require('./models/groups');
    require('./models/events'); 
    require('./models/comments'); 
    // DB config and models
    db.sync().then(() => console.log('Connected database')).catch((error) => console.log(error));

// Dev variables
require('dotenv').config({ path: 'variables.env' });
//require('dotenv').config();

// Main application
const app = express();

// archivos staticos
app.use(express.static('public'));

// Body parser, read forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express validator (validations)
app.use(expressValidator());

// Enable EJS as the template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Views locations
app.set('views', path.join(__dirname, './views'));

// Static files
app.use(express.static('public'));

// Enable cookie-parser
app.use(cookieParser());

// Enable express-session
app.use(session({
    secret: process.env.SECRET_KEY,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Start passport
app.use(passport.initialize());
app.use(passport.session());

// Enable connect-flash for flash messages
app.use(flash());

// Middleware (logged user, flash messages, actual date)
app.use((req, res, next) => {
    res.locals.user = {...req.user} || null;
    console.log(res.locals.user);
    res.locals.messages = req.flash();
    const date = new Date();
    res.locals.year = date.getFullYear();
    next();
});

// Routing
app.use('/', router());

// Read host and port
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

// Add port
app.listen(port, host, () => {
    console.log('The server is running.');
});