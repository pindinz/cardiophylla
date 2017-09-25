(function () {
    'use strict';

    const contextFactory = require('../util/contextFactory');


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

    module.exports = {
        createInvitation: createInvitation,
        inviteUser: inviteUser,
        acceptInvitation: acceptInvitation,
        renderUserDetail: renderUserDetail,
        createUser: createUser,
        updateUser: updateUser,
        renderUserList: renderUserList
    };

})();