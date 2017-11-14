(function () {
    'use strict';

    const jwt = require('jwt-express');
    const logger = require('winston');

    const authenticationService = require('./service');
    const userService = require('../user/service');

    function renderLoginForm(req, res) {
        res.status(200).render('authentication/loginForm', {layout: false});
    };

    function login(req, res) {
        userService.loadByEmail(req.body.email, true)
            .then(function (user) {
                const credentials = {
                    status: user.status,
                    passwordHash: user.passwordHash,
                    passwordSalt: user.passwordSalt
                };
                if (authenticationService.authenticate(credentials, req.body.password)) {
                    return user;
                } else {
                    return false;
                }
            })
            .then(function (user) {
                if (user) {
                    req.user = user;
                    res.jwt({
                        sub: user._id
                    });
                    res.status(204).end();
                }
                else {
                    res.status(401).end();
                }
            })
            .catch(function (err) {
                logger.error('Authentication failed');
                logger.debug(err);
                res.status(401).end();
            });

    }

    function logout(req, res) {
        jwt.clear();
        res.status(204).end();
    }

    module.exports = {
        renderLoginForm: renderLoginForm,
        login: login,
        logout: logout
    };

})();