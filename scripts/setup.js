(function () {
    'use strict';

    const ADMIN_EMAIL = 'admin@cardiophylla.ch';

    const mongoose = require('mongoose');
    require('../app/persistence').init();
    const AUTHORISATION_FIELD_NAME = require('../app/authorisation/authorisationPluginFieldName');
    const SYSTEM_ROLES = require('../app/authorisation/systemRoles');
    const USER_ENTITY_ACTIONS = require('../app/user/authorisation').ENTITY_ACTIONS;
    const authenticationService = require('../app/authentication/service');
    const userService = require(('../app/user/service'));


    userService.loadByEmail(ADMIN_EMAIL, [SYSTEM_ROLES.ADMIN])
        .then(function (user) {
            console.log('The administrator already exists, ID=' + user._id);
        })
        .catch(function (err) {
            if (err.message === 'READ_USER_NOT_FOUND') {
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
                user[AUTHORISATION_FIELD_NAME] = {};
                user[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userService.update(user, [SYSTEM_ROLES.ADMIN])
                    .then(function (savedUser) {
                        userService.grantAuthorisation(savedUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.UPDATE, SYSTEM_ROLES.ADMIN);
                        userService.grantAuthorisation(savedUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.ADMIN);
                        userService.grantAuthorisation(savedUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.DEACTIVATE, SYSTEM_ROLES.ADMIN);
                        userService.grantAuthorisation(savedUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.RESET_PASSWORD, SYSTEM_ROLES.ADMIN);

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
            }
        });


})();