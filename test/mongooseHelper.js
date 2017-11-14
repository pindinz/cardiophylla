(function () {
    'use strict';

    const MONGODB_URI = 'mongodb://localhost:27017/cardiophylla-test';

    const mongoose = require('mongoose');


    module.exports = {
        setUp: setUp,
        tearDown: tearDown
    };

     function setUp() {

        mongoose.Promise = global.Promise;

        mongoose.connection.on('error', function (err) {
            console.error(err);
            process.exit(1);
        });

        return mongoose.connect(MONGODB_URI, {useMongoClient: true});

    }

     function tearDown() {

        return mongoose.connection.db.dropDatabase()
            .then(function() {
                return mongoose.connection.close();
            });

    }
})();