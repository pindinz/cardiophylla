(function () {
    'use strict';

    const userController = require('./controller');


    function init(app) {

        app.get('/invitation', userController.createInvitation);

        app.post('/invitation', userController.inviteUser);

        app.get('/invitation/:token', userController.acceptInvitation);

        app.get('/user/:userId', userController.renderUserDetail);

        app.post('/user', userController.createUser);

        app.post('/user/:userId', userController.updateUser);

        app.get('/user', userController.renderUserList);
    }



    module.exports = {init: init};

})();