(function () {
    'use strict';

    const ADMIN_EMAIL = 'admin@cardiophylla.ch';

    const mongoose = require('mongoose');
    require('../app/persistence').init();
    const SYSTEM_ROLES = require('../app/authorisation/systemRoles');
    const authenticationService = require('../app/authentication/service');
    const userService = require(('../app/user/service'));


    userService.loadByEmail(ADMIN_EMAIL)
        .then(function (user) {
            if (user) {
                console.log('Administrator already exists. ID=' + user._id);
            } else {
                console.log('Creating Administrator...');
                var salt = authenticationService.createPasswordSalt();
                var hash = authenticationService.createPasswordHash('secret', salt);
                var user = {
                    email: ADMIN_EMAIL,
                    passwordHash: hash,
                    passwordSalt: salt,
                    status: 'ACTIVE',
                    name: 'Administrator',
                    roles: [SYSTEM_ROLES.ADMIN]
                };
                return userService.update(user);
            }
        })
        .then(function (savedUser) {
            console.log('done. ID=' + savedUser._id);
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