(function () {
    'use strict';

    const path = require('path');
    const nodeModulesPath = require('./nodeModulesPath');
    const coreController = require('./controller');


    module.exports = {
        init: init
    };


    function init(app) {

        app.get('/', coreController.renderHome);

        app.get('/css/bootstrap.css', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./bootstrap/dist/css/bootstrap.css', options);
        });

        app.get('/css/bootstrap.css.map', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./bootstrap/dist/css/bootstrap.css.map', options);
        });

        app.get('/css/font-awesome.min.css', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./font-awesome/css/font-awesome.min.css', options);
        });

        app.get('/fonts/:filename', function (req, res) {
            const filename = req.params.filename;
            if (!filename.startsWith('../') && !filename.includes('/../')) {
                const options = {
                    root: path.join(nodeModulesPath, 'font-awesome/fonts')
                };
                res.status(200).sendFile(filename, options);
            }
        });

        app.get('/js/bootstrap.min.js', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./bootstrap/dist/js/bootstrap.min.js', options);
        });

        app.get('/js/jquery.min.js', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./jquery/dist/jquery.min.js', options);
        });

        app.get('/js/popper.min.js', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./popper.js/dist/umd/popper.min.js', options);
        });

        app.get('/js/popper.min.js.map', function (req, res) {
            const options = {
                root: nodeModulesPath
            };
            res.status(200).sendFile('./popper.js/dist/umd/popper.min.js.map', options);
        });

    }

})();