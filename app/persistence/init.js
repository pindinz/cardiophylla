(function () {
    'use strict';

    const mongoose = require('mongoose');
    const logger = require('winston');
    const MONGODB_URI = process.env.MONGODB_URI || false;


    function init() {

        if (!MONGODB_URI) {
            logger.error('MONGODB_URI not defined.');
            process.exit(1);
        }

        mongoose.set('debug', true);    // TODO

        mongoose.Promise = global.Promise;

        mongoose.connect(MONGODB_URI, {useMongoClient: true});

        mongoose.connection.on('error', function (err) {
            logger.error(err);
        });

        mongoose.connection.once('connected', function () {
            logger.info('Connected to MongoDB at ' + MONGODB_URI);
        });

        mongoose.connection.once('open', function () {
            logger.info('Connection to MongoDB opened.');
        });



    }

    module.exports = init;

})();