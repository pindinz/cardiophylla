(function () {
    'use strict';

    function createContext(req, res, data) {
        let context = {
            meta: {},
            data: (data || null)
        };

        context.meta.correlationId = req.correlationId;

        context.meta.navigation = createNavigation(req);

        context.meta.user = {
            name: (req.user ? (req.user.name || req.user.email) : ''),
            authenticated: (req.user && req.user._id !== null)
        };
        if(context.meta.user.authenticated) {
            context.meta.user.id = req.user._id;
        }

        return context;
    }

    function createNavigation(req){
        let navigation = {};

        navigation.home = req.path === '/';
        navigation.settings = req.path === '/settings';

        return navigation;
    }

    module.exports = {createContext: createContext};

})();