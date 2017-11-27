(function () {
    'use strict';

    const authorisationRepository = require('./repository');

    module.exports = {
        grantAuthorisation: grantAuthorisation,
        revokeAuthorisation: revokeAuthorisation,
        isAuthorised: isAuthorised
    };


    function grantAuthorisation(action, role) {

        return authorisationRepository.addRoleToAction(action, role);

    }

    function revokeAuthorisation(action, role) {

        return authorisationRepository.removeRoleFromAction(action, role);

    }

    function isAuthorised(action, roles) {

        return authorisationRepository.countActionWithRole(action, roles)
            .then(function (result) {
                return result > 0;
            });
    }


})();