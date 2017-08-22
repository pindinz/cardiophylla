(function(){
    'use strict';

    const fs = require("fs");
    const hbs = require("hbs");


    function init (app) {

        hbs.registerPartial('navigation', fs.readFileSync(__dirname + '/navigation.hbs', 'utf8'));
    }

    module.exports = init;

})();