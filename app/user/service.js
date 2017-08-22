(function () {
    'use strict';

    const repository = require('./repository');


    function save(user) {
        return repository.save(user);
    }

    function loadById(id, withCredentials) {
        return repository.loadById(id, withCredentials);
    }

    function loadByEmail(email, withCredentials) {
        return repository.loadByEmail(email, withCredentials);
    }

    function loadAll() {
    }


    module.exports = {
        save: save,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll
    };

})();