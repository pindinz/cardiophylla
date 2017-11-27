(function () {
    'use strict';

    const authenticationController = require('./controller');


    module.exports = {
        init: init
    };


    function init(app) {

        app.get('/html/loginForm.html', authenticationController.renderLoginForm);

        app.post('/login', authenticationController.login);

        app.get('/logout', authenticationController.logout);

        app.get('/js/loginForm.js', function (req, res) {
            const options = {
                root: __dirname
            };
            res.status(200).sendFile('./loginForm.js', options);
        });

        app.get('/js/login.js', function (req, res) {
            const options = {
                root: __dirname
            };
            res.status(200).sendFile('./login.js', options);
        });

        app.get('/js/logout.js', function (req, res) {
            const options = {
                root: __dirname
            };
            res.status(200).sendFile('./logout.js', options);
        });
    }

})();