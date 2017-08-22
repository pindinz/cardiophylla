(function () {
    'use strict';

    const mongoose = require('mongoose');
    const uuid = require('uuid/v1');
    require('../app/persistence').init();
    const authenticationService = require('../app/authentication/service');
    const userService = require(('../app/user/service'));


    var salt = authenticationService.createPasswordSalt();
    var hash = authenticationService.createPasswordHash('secret', salt);
    var user = {
        _id: uuid(),
        email: 'admin@cardiophylla.ch',
        passwordHash: hash,
        passwordSalt: salt,
        status: 'ACTIVE',
        name: 'Administrator'
    };
    console.log('Creating Administrator...');
    userService.save(user)
        .then(function (savedUser) {
            console.log('done. ID=' + savedUser._id);
            mongoose.disconnect();
        });

})();