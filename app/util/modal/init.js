(function(){
    'use strict';

    const fs = require("fs");
    const hbs = require("hbs");


    function init (app) {

        hbs.registerPartial('modal', fs.readFileSync(__dirname + '/modal.hbs', 'utf8'));

        require('./routes').init(app);
    }

    module.exports = {init: init};

})();