(function () {
    'use strict';

    const contextFactory = require('../util/contextFactory');


    function init(app) {

        app.get('/invitation', createInvitation);

        app.post('/invitation', inviteUser);

        app.get('/invitation/:token', acceptInvitation);

        app.get('/user/:userId', renderUserDetail);

        app.post('/user', createUser);

        app.post('/user/:userId', updateUser);

        app.get('/user', renderUserList);
    }

    function createInvitation(req, res) {
        res.status(200);
        res.render('user/createInvitation', contextFactory.createContext(req, res, {}));
    }

    function inviteUser(req, res) {
        res.send(req.body.email + ' invited');
    }

    function acceptInvitation(req, res) {
        res.send('Invitation accepted: ' + req.params.token);
    }

    function renderUserDetail(req, res) {
        res.status(200);
        res.render('user/userDetail', contextFactory.createContext(req, res, {}));
    }

    function createUser(req, res) {
        // TODO

    }

    function updateUser(req, res) {

    }

    function renderUserList(req, res) {
        res.status(200);
        res.render('user/userList', contextFactory.createContext(req, res, {}));
    }

    module.exports = {init: init};

})();