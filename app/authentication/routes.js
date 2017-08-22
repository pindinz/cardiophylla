(function () {
    'use strict';

    const jwt = require('jwt-express');
    const logger = require('winston');

    const authenticationService = require('./service');
    const userService = require('../user/service');

    function init(app) {

        app.get('/html/loginForm.html', function (req, res) {
            res.status(200).render('authentication/loginForm', {layout: false});
        });

        app.get('/js/loginForm.js', function (req, res) {
            var options = {
                root: __dirname
            };
            res.status(200).sendFile('./loginForm.js', options);
        });

        app.get('/js/login.js', function (req, res) {
            var options = {
                root: __dirname
            };
            res.status(200).sendFile('./login.js', options);
        });

        app.get('/js/logout.js', function (req, res) {
            var options = {
                root: __dirname
            };
            res.status(200).sendFile('./logout.js', options);
        });

        app.post('/login', login);

        app.get('/logout', logout);
    }

    function login(req, res) {
        userService.loadByEmail(req.body.email, true)
            .then(function (user) {
                return authenticationService.authenticate(user, req.body.password);
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

    module.exports = {init: init};

})();