(function () {
    'use strict';

    const AUTHORISATION_FIELD_NAME = require('./authorisationPluginFieldName');

    module.exports = authorisationSchemaPlugin;

    function authorisationSchemaPlugin(schema, actions) {

        if (actions && Array.isArray(actions)) {

            let authorisationSchema = {};
            authorisationSchema[AUTHORISATION_FIELD_NAME] = {};
            for (let i = 0; i < actions.length; i++) {
                authorisationSchema[AUTHORISATION_FIELD_NAME][actions[i]] = {type: [String], index: true};
            }

            schema.add(authorisationSchema);

            schema.query.checkAuthorisation = checkAuthorisation;

        }

    }

    function checkAuthorisation(action, roles) {

        const actionField = AUTHORISATION_FIELD_NAME + '.' + action;
        let query = {};
        query[actionField] = {$in: roles};

        return this.find(query);

    }


})();