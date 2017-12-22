(function () {
    'use strict';

    const MONGODB_URI = 'mongodb://localhost:27017/cardiophylla-test';

    const mongoose = require('mongoose');


    module.exports = {
        setUp: setUp,
        tearDown: tearDown,
        createObjectId: createObjectId
    };

    function setUp() {

        mongoose.Promise = global.Promise;

        mongoose.connection.on('error', function (err) {
            console.error(err);
            process.exit(1);
        });

        // Avoid background operations that interfere with #tearDown by disabling autoIndex.
        return mongoose.connect(MONGODB_URI, {config: {autoIndex: false}, useMongoClient: true});

    }

    function tearDown() {

        mongoose.models = {};

        return mongoose.connection.db.dropDatabase()
            .then(function () {
                return mongoose.connection.close();
            });

    }

    function createObjectId() {
        return mongoose.Types.ObjectId();
    }
})();