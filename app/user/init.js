(function () {
    'use strict';


    function init(app) {

        require('./routes').init(app);
    }

    module.exports = {init: init};

})();