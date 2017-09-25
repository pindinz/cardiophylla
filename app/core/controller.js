(function () {
    'use strict';

    const contextFactory = require('../util/contextFactory');


    function renderHome(req, res) {
        res.status(200);
        res.render('core/home', contextFactory.createContext(req, res, {}));
    }

    module.exports = {renderHome: renderHome};

})();