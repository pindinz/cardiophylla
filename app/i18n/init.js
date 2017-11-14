(function(){
    'use strict';

    const hbs = require('hbs');
    const i18n = require('i18n');

    function init (app) {

        i18n.configure({
            locales:['en', 'de'],
            defaultLocale: 'en',
            directory: __dirname + '/locales'
        });

        app.use(i18n.init);

        hbs.registerHelper('__', function () {
            return i18n.__.apply(this, arguments);
        });

    }

    module.exports = {init: init};

})();