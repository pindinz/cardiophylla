(function () {
    'use strict';

    const GENERAL_ACTIONS = {
        INVITE_USER: 'INVITE_USER'
    };
    const ENTITY_ACTIONS = {
        READ: 'READ',
        DEACTIVATE: 'DEACTIVATE',
        UPDATE: 'UPDATE',
        RESET_PASSWORD: 'RESET_PASSWORD',
        GRANT_REVOKE_AUTHORISATION: 'GRANT_REVOKE_AUTHORISATION'
    };

    module.exports = {
        GENERAL_ACTIONS: GENERAL_ACTIONS,
        ENTITY_ACTIONS: ENTITY_ACTIONS
    };


})();