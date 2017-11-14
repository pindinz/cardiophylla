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
        mongoose.set('debug', process.env.NODE_ENV !== 'production');

        mongoose.Promise = global.Promise;

        mongoose.connect(MONGODB_URI, {useMongoClient: true});

        mongoose.connection.on('error', function (err) {
            logger.error(err);
            process.exit(1);
        });

        mongoose.connection.once('open', function () {
            logger.info('Connection to MongoDB at ' + MONGODB_URI + ' opened. ');
        });


    }

    module.exports = {init: init};

})();