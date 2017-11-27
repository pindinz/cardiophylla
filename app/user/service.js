(function () {
    'use strict';

    const repository = require('./repository');

    module.exports = {
        save: save,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll
    };

    function save(user) {
        ensureUniqueRoles(user);
        return repository.save(user);
    }

    function loadById(id, withCredentials) {
        return repository.loadById(id, withCredentials);
    }

    function loadByEmail(email, withCredentials) {
        return repository.loadByEmail(email, withCredentials);
    }

    function loadAll() {
        return repository.loadAll();
    }

    function ensureUniqueRoles(user) {
        if (user && user.roles) {
            for (let i = user.roles.length - 1; i >= 0; i--) {
                if (user.roles.indexOf(user.roles[i]) < i) {
                    user.roles.splice(i, 1);
                }
            }
        }
    }

})();