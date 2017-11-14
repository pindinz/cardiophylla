(function () {
    'use strict';

    const ADMIN_EMAIL = 'admin@cardiophylla.ch'

    const mongoose = require('mongoose');
    require('../app/persistence').init();
    const permissions = require('../app/permissions');
    const authenticationService = require('../app/authentication/service');
    const userService = require(('../app/user/service'));


    userService.loadByEmail(ADMIN_EMAIL)
        .then(function (user) {
            if (user) {
                console.log('Administrator already exists. ID=' + user._id);
                return;
            } else {
                console.log('Creating Administrator...');
                var salt = authenticationService.createPasswordSalt();
                var hash = authenticationService.createPasswordHash('secret', salt);
                var user = {
                    email: ADMIN_EMAIL,
                    passwordHash: hash,
                    passwordSalt: salt,
                    status: 'ACTIVE',
                    name: 'Administrator'
                };
                return userService.save(user)
                    .then(function (savedUser) {
                        console.log('done. ID=' + savedUser._id);
                        return;
                    });
            }
        })
        .then(function () {
            return permissions.addRoleToAction('admin', 'settings', 'update',
                function (err) {
                    console.error(err)
                });
        })
        .then(function (arg) {
            console.log((arg));
        })
        .then(function () {
            mongoose.disconnect();
            console.log('Database connection closed.')
        })
        .catch(function (err) {
            console.error(err);
            mongoose.disconnect();
            console.log('Database connection closed.')
        });


})();