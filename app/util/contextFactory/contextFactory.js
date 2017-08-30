(function () {
    'use strict';

    function createContext(req, res, data) {
        var context = {
            meta: {},
            data: (data || null)
        };

        context.meta.correlationId = req.correlationId;

        context.meta.navigation = createNavigation(req);

        context.meta.user = {
            name: (req.user ? (req.user.name || req.user.email) : ''),
            authenticated: (req.user && req.user._id != null)
        }

        return context;
    }

    function createNavigation(req){
        var navigation = {};

        navigation.home = req.path === '/';
        navigation.settings = req.path === '/settings';

        return navigation;
    }

    module.exports = {createContext: createContext};

})();