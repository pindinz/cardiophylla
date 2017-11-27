(function () {
    'use strict';

    const GENERAL_ACTIONS = {
        INVITE: 'INVITE'
    };
    const ENTITY_ACTIONS = {
        DEACTIVATE: 'DEACTIVATE',
        UPDATE: 'UPDATE',
        RESET_PASSWORD: 'RESET_PASSWORD'
    };

    module.exports = {
        GENERAL_ACTIONS: GENERAL_ACTIONS,
        ENTITY_ACTIONS: ENTITY_ACTIONS,
        ENTITY_ACTION_VALUES: Object.values(ENTITY_ACTIONS)
    };


})();