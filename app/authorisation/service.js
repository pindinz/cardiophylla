(function () {
    'use strict';

    const authorisationRepository = require('./repository');

    module.exports = {
        authorise: authorise,
        isAuthorised: isAuthorised
    };


    function authorise(action, role) {

        return authorisationRepository.addRoleToAction(action, role);

    }

    function isAuthorised(action, role) {

        return authorisationRepository.countActionWithRole(action, role).then(function (result) {
            return result > 0;
        })
    }


})();