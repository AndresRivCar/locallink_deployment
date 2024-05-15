/**
 * Module that exports an Express router with various routes.
 * 
 * @module routes
 * 
 * @returns {Object} Express router instance.
 * 
 * @author Andres Rivera
 */

const express = require('express');
const router = express.Router();

// Back end controllers
const homeController = require('../controllers/homeController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const groupsController = require('../controllers/groupsController');
const eventsController = require('../controllers/eventsController');
const recommendationsController = require('../controllers/recommendationsController');
//const testController = require('../controllers/testController');

// Front end controllers
const eventsControllerFE = require('../controllers/frontend/eventsControllerFE');
const usersControllerFE  = require('../controllers/frontend/usersControllerFE');
const groupsControllerFE  = require('../controllers/frontend/groupsControllerFE');
const commentsControllerFE  = require('../controllers/frontend/commentsControllerFE');
const searchControllerFE  = require('../controllers/frontend/searchControllerFE');

/**
 * Defines various routes and their corresponding controllers.
 * @function
 * @name module.exports
 * @returns {Object} Express router instance.
 */
module.exports = function() {
    /* Public area */

    /**
     * Route for the home page.
     * @name GET /
     * @function
     * @memberof module:routes
     * @param {function} homeController.home - Controller for the home route.
     */
    router.get('/', homeController.home);

    /**
     * Route to display details of a specific event.
     * @name GET /event/:slug
     * @function
     * @memberof module:routes
     * @param {function} eventsControllerFE.showEvent - Controller for displaying details of a specific event.
     */
    router.get('/event/:slug', eventsControllerFE.showEvent);

    /**
     * Route to confirm assistance to a specific event.
     * @name POST /confirm-assistance/:slug
     * @function
     * @memberof module:routes
     * @param {function} eventsControllerFE.confirmAssistance - Controller for confirming assistance to a specific event.
     */
    router.post('/confirm-assistance/:slug', eventsControllerFE.confirmAssistance);

    /**
     * Route to display attendees of a specific event.
     * @name GET /attendees/:slug
     * @function
     * @memberof module:routes
     * @param {function} eventsControllerFE.showAttendees - Controller for displaying attendees of a specific event.
     */
    router.get('/attendees/:slug', eventsControllerFE.showAttendees);

    /**
     * Route to add a comment to a specific event.
     * @name POST /event/:id
     * @function
     * @memberof module:routes
     * @param {function} commentsControllerFE.addComment - Controller for adding a comment to a specific event.
     */
    router.post('/event/:id', commentsControllerFE.addComment);

    /**
     * Route to delete a comment.
     * @name POST /delete-comment
     * @function
     * @memberof module:routes
     * @param {function} commentsControllerFE.deleteComment - Controller for deleting a comment.
     */
    router.post('/delete-comment', commentsControllerFE.deleteComment);

    /**
     * Route to display details of a specific user.
     * @name GET /users/:id
     * @function
     * @memberof module:routes
     * @param {function} usersControllerFE.showUser - Controller for displaying details of a specific user.
     */
    router.get('/users/:id', usersControllerFE.showUser);

    /**
     * Route to display details of a specific group.
     * @name GET /groups/:id
     * @function
     * @memberof module:routes
     * @param {function} groupsControllerFE.showGroup - Controller for displaying details of a specific group.
     */
    router.get('/groups/:id', groupsControllerFE.showGroup);

    /**
     * Route to display events of a specific category.
     * @name GET /category/:category
     * @function
     * @memberof module:routes
     * @param {function} eventsControllerFE.showEventsCategory - Controller for displaying events of a specific category.
     */
    router.get('/category/:category', eventsControllerFE.showEventsCategory);

    /**
     * Route to display search results.
     * @name GET /search
     * @function
     * @memberof module:routes
     * @param {function} searchControllerFE.searchResults - Controller for displaying search results.
     */
    router.get('/search', searchControllerFE.searchResults);

    /**
     * Route to display the account creation form.
     * @name GET /create-account
     * @function
     * @memberof module:routes
     * @param {function} usersController.formCreateAccount - Controller for the account creation form.
     */
    router.get('/create-account', usersController.formCreateAccount);

    /**
     * Route to handle the creation of a new account.
     * @name POST /create-account
     * @function
     * @memberof module:routes
     * @param {function} usersController.createNewAccount - Controller for creating a new account.
     */
    router.post('/create-account', usersController.createNewAccount);

    /**
     * Route to confirm a user account based on the provided email.
     * @name GET /confirm-account/:email
     * @function
     * @memberof module:routes
     * @param {function} usersController.confirmAccount - Controller for confirming a user account.
     */
    router.get('/confirm-account/:email', usersController.confirmAccount);

    /**
     * Route to display the login form.
     * @name GET /login
     * @function
     * @memberof module:routes
     * @param {function} usersController.formLogin - Controller for the login form.
     */
    router.get('/login', usersController.formLogin);

    /**
     * Route to handle user authentication.
     * @name POST /login
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticateUser - Controller for authenticating a user.
     */
    router.post('/login', authController.authenticateUser);

    // cerrar sesion
    router.get('/sign-off', authController.authenticatedUser, authController.signOff);

    /* AREA PRIVADA */

    /**
     * Route to display the admin panel.
     * @name GET /admin
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware for authenticating users.
     * @param {function} adminController.adminPanel - Controller for the admin panel.
     */
    router.get('/admin', authController.authenticatedUser, adminController.adminPanel);

    /**
     * Route to display the form for creating a new group.
     * @name GET /new-group
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware for authenticating users.
     * @param {function} groupsController.formNewGroup - Controller for the new group form.
     */
    router.get('/new-group', authController.authenticatedUser, groupsController.formNewGroup);

    /**
     * Route to handle the creation of a new group, including uploading an image.
     * @name POST /new-group
     * @function
     * @memberof module:routes
     * @param {function} groupsController.uploadImage - Middleware for uploading group images.
     * @param {function} groupsController.createGroup - Controller for creating a new group.
     */
    router.post('/new-group', authController.authenticatedUser, groupsController.uploadImage, groupsController.createGroup);

    /**
     * Route to render the form for editing an existing group.
     * @name GET /edit-group/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.formEditGroup - Controller to render the form for editing a group.
     */
    router.get('/edit-group/:groupId', authController.authenticatedUser, groupsController.formEditGroup);

    
    /**
     * Route to handle the submission of edited group information.
     * @name POST /edit-group/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.editGroup - Controller for editing an existing group.
     */
    router.post('/edit-group/:groupId', authController.authenticatedUser, groupsController.editGroup);

    /**
     * Route to render the form for editing the image of a group.
     * @name GET /group-image/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.formEditImage - Controller to render the form for editing a group image.
     */
    router.get('/group-image/:groupId', authController.authenticatedUser, groupsController.formEditImage);

    /**
     * Route to handle the submission of edited group image information.
     * @name POST /group-image/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.uploadImage - Middleware for uploading group images.
     * @param {function} groupsController.editImage - Controller for editing the image of a group.
     */
    router.post('/group-image/:groupId', authController.authenticatedUser, groupsController.uploadImage, groupsController.editImage);

    /**
     * Route to retrieve the form for deleting a group.
     * @name GET /delete-group/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.formDeleteGroup - Controller for displaying the delete group form.
     */
    router.get('/delete-group/:groupId', authController.authenticatedUser, groupsController.formDeleteGroup);

    /**
     * Route to handle the submission of group deletion request.
     * @name POST /delete-group/:groupId
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} groupsController.deleteGroup - Controller for deleting a group.
     */
    router.post('/delete-group/:groupId', authController.authenticatedUser, groupsController.deleteGroup);
    

    /**
     * Route to render the form for creating a new event.
     * @name GET /new-event
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} eventsController.formCreateEvent - Controller to render the form for creating a new event.
     */
    router.get('/new-event', authController.authenticatedUser, eventsController.formCreateEvent);

    /**
     * Route to handle the submission of a new event creation.
     * @name POST /new-event
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate the user.
     * @param {function} eventsController.sanitizeEvent - Middleware to sanitize the event data.
     * @param {function} eventsController.createEvent - Controller for creating a new event.
     */
    router.post('/new-event', authController.authenticatedUser, eventsController.sanitizeEvent, eventsController.createEvent);

    /**
     * Route to display the form for editing an event.
     * @name GET /edit-event/:id
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} eventsController.formEditEvent - Controller for displaying the form for editing an event.
     */
    router.get('/edit-event/:id', authController.authenticatedUser, eventsController.formEditvent);

    /**
     * Route to edit an event.
     * @name POST /edit-event/:id
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} eventsController.editEvent - Controller for editing an event.
     */
    router.post('/edit-event/:id', authController.authenticatedUser, eventsController.editEvent);

    /**
     * Route to display the form for deleting an event.
     * @name GET /delete-event/:id
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} eventsController.formDeleteEvent - Controller for displaying the form for deleting an event.
     */
    router.get('/delete-event/:id', authController.authenticatedUser, eventsController.formDeletEvent);

    /**
     * Route to delete an event.
     * @name POST /delete-event/:id
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} eventsController.deleteEvent - Controller for deleting an event.
     */
    router.post('/delete-event/:id', authController.authenticatedUser, eventsController.deleteEvent);

    /**
     * Route to display the form for editing a user's profile.
     * @name GET /edit-profile
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.formEditProfile - Controller for displaying the form for editing a user's profile.
     */
    router.get('/edit-profile', authController.authenticatedUser, usersController.formEditProfile);

    /**
     * Route to edit a user's profile.
     * @name POST /edit-profile
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.editProfile - Controller for editing a user's profile.
     */
    router.post('/edit-profile', authController.authenticatedUser, usersController.editProfile);

    /**
     * Route to display the form for changing user's password.
     * @name GET /change-password
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.formChangePassword - Controller for displaying the form for changing user's password.
     */
    router.get('/change-password', authController.authenticatedUser, usersController.formChangePassword);

    /**
     * Route to change user's password.
     * @name POST /change-password
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.changePassword - Controller for changing user's password.
     */
    router.post('/change-password', authController.authenticatedUser, usersController.changePassword);

    /**
     * Route to display the form for uploading a profile image.
     * @name GET /profile-image
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.formUploadProfileImage - Controller for displaying the form for uploading a profile image.
     */
    router.get('/profile-image', authController.authenticatedUser, usersController.formUploadProfileImage);

    /**
     * Route to upload a profile image.
     * @name POST /profile-image
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} usersController.uploadImage - Middleware for uploading image.
     * @param {function} usersController.saveProfileImage - Controller for saving the uploaded profile image.
     */
    router.post('/profile-image', authController.authenticatedUser, usersController.uploadImage, usersController.saveProfileImage);

    /**
     * Route to display user recommendations.
     * @name GET /recommendations
     * @function
     * @memberof module:routes
     * @param {function} authController.authenticatedUser - Middleware to authenticate users.
     * @param {function} recommendationsController.getRecommendations - Controller for fetching user recommendations.
     */
    router.get('/recommendations/:id', authController.authenticatedUser, recommendationsController.getRecommendations);
    //router.get('/recommendations', authController.authenticatedUser, testController.getRecommendations);


    return router;
}