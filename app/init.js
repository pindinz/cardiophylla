(function () {
    'use strict';

    const compression = require('compression');
    const correlator = require('express-correlation-id');
    const express = require('express');
    const requestLogger = require('morgan');
    requestLogger.token('correlationId', function (req, res) {
        return req.correlationId();
    });
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const helmet = require('helmet');
    const logger = require('winston');
    logger.level = process.env.LOG_LEVEL || process.env.NODE_ENV === 'production' ? 'info' : 'silly';

    const app = express();

    app.set('view engine', 'hbs');
    app.set('view options', { layout: 'core/layout' });
    app.set('views', __dirname);

    app.use(correlator());
    app.use(requestLogger(':method :status :correlationId :url :response-time ms - :res[content-length] bytes'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(compression());
    app.use(cookieParser());
    app.use(helmet());

    require('./i18n').init(app);
    require('./authentication').init(app);
    require('./persistence').init();
    require('./util/modal').init(app);
    require('./core').init(app);
    require('./navigation').init(app);
    require('./user').init(app);

    require('./core').postInit(app);

    module.exports = app;


})();