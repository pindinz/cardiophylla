(function () {
    'use strict';

    const JWT_COOKIE_NAME = 'jwt';
    const AUTHENTICATION_TIMEOUT = 900; //seconds

    const crypto = require('crypto');
    const fs = require('fs');
    const hbs = require('hbs');
    const jwt = require('jwt-express');
    const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(256).toString('hex');
    const jwtOptions = {
        cookie: JWT_COOKIE_NAME,
        cookieOptions: {httpOnly: true, 'Max-Age': AUTHENTICATION_TIMEOUT},
        stales: 1000 * AUTHENTICATION_TIMEOUT
    };
    const passport = require('passport');
    const passportJwt = require('passport-jwt');
    const JwtStrategy = passportJwt.Strategy;
    const ExtractJwt = passportJwt.ExtractJwt;
    const jwtStrategyOptions = {
        jwtFromRequest: ExtractJwt.fromExtractors([jwtFromRequestCookie]),
        secretOrKey: jwtSecret,
        ignoreExpiration: false
    };
    const logger = require('winston');
    const contextFactory = require('../util/contextFactory');
    const userService = require('../user/service');


    function init(app) {

        app.use(jwt.init(jwtSecret, jwtOptions));

        passport.use(new JwtStrategy(jwtStrategyOptions, jwtVerify));

        app.use(passport.initialize());

        app.use('*',
            function (req, res, next) {
                passport.authenticate('jwt',
                    function (err, user, info) {
                        if (info && info.name === 'JsonWebTokenError') {
                            logger.warn('Unauthorized: Invalid JWT');
                            jwt.clear();
                            var context = contextFactory.createContext(req, res, {messageKey: 'authentication.authenticationFailed.message.jwtInvalid'});
                            return res.status(401).render('authentication/authenticationFailed', context);
                        }
                        if (err) {
                            logger.error(err);
                            return next(err);
                        }
                        if (!user) {
                            user = {};
                        }
                        req.user = user;
                        return next(null, req, res);
                    })(req, res, next);
            });


        // error handler
        app.use(function (err, req, res, next) {
            console.error(err);
            if (err.name === 'UnauthorizedError' && err.message === 'invalid signature') {
                logger.warn('Unauthorized: Invalid JWT');
                logger.debug(err);
                jwt.clear();
                res.redirect('/');
            }
            else {
                next(err, req, res, next);
            }
        });

        hbs.registerPartial('logout', fs.readFileSync(__dirname + '/logout.hbs', 'utf8'));

        require('./routes').init(app);
    }

    function jwtFromRequestCookie(req) {
        var token = null;
        if (req && req.cookies && req.cookies[JWT_COOKIE_NAME]) {
            token = req.cookies[JWT_COOKIE_NAME];
        }
        return token;
    }

    function jwtVerify(jwtPayload, done) {
        userService.loadById(jwtPayload.sub)
            .then(function (user) {
                console.log(user);
                return done(null, user);
            })
            .catch(function (err) {
                return done(null, {});
            });
    }

    module.exports = init;

})();