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

            schema.query.isAuthorised = isAuthorised;

            schema.query.isAuthorisedOne = isAuthorisedOne;

            schema.methods.grantAuthorisation = grantAuthorisation;

            schema.methods.revokeAuthorisation = revokeAuthorisation;

            schema.methods.getAuthorisation = getAuthorisation;

        }

    }
    
    function grantAuthorisation(action, role) {

        if(this[AUTHORISATION_FIELD_NAME][action].indexOf(role) === -1) {
            this[AUTHORISATION_FIELD_NAME][action].push(role);
            return this.save();
        }
        return Promise.resolve(this);
    }

    function revokeAuthorisation(action, role) {
        const initialLength = this[AUTHORISATION_FIELD_NAME][action].length;
        this[AUTHORISATION_FIELD_NAME][action] = this[AUTHORISATION_FIELD_NAME][action].filter(function (elem) {
            return elem !== role;
        });
        if(initialLength !== this[AUTHORISATION_FIELD_NAME][action].length) {
            return this.save();
        }
        return Promise.resolve(this);
    }

    function isAuthorised(action, roles) {
        return this.find(createAuthorisedQuery(action, roles));
    }

    function isAuthorisedOne(action, roles) {
        return this.findOne(createAuthorisedQuery(action, roles));
    }

    function getAuthorisation() {
        return this[AUTHORISATION_FIELD_NAME];
    }

    function createAuthorisedQuery(action, roles) {
        const actionField = AUTHORISATION_FIELD_NAME + '.' + action;
        let query = {};
        query[actionField] = {$in: roles};
        return query;
    }


})();