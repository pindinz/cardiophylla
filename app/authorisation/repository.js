(function () {
    'use strict';

    const mongoose = require('mongoose');
    const sanitize = require('mongo-sanitize');

    module.exports = {
        addRoleToAction: addRoleToAction,
        removeRoleFromAction: removeRoleFromAction,
        countActionWithRole: countActionWithRole,
        loadActionRoles: loadActionRoles
    };

    const authorisationSchema = mongoose.Schema({
        action: {type: String, unique: true},
        roles: {type: [String]}
    });

    const Authorisation = mongoose.model('Authorisation', authorisationSchema);

    function addRoleToAction(action, role) {

        const update = {
            $addToSet: {
                roles: role
            }
        };

        const options = {
            new: true,
            upsert: true
        };

        return Authorisation.findOneAndUpdate({action: sanitize(action)}, update, options);
    }

    function removeRoleFromAction(action, role) {

        const update = {
            $pullAll: {
                roles: [role]
            }
        };

        const options = {
            new: true,
            upsert: false
        };

        return Authorisation.findOneAndUpdate({action: sanitize(action)}, update, options);
    }

    function countActionWithRole(action, roles) {
        return Authorisation.count({action: sanitize(action), roles: {$in: sanitize(roles)}});
    }

    function loadActionRoles(action) {
        return Authorisation.findOne({action: sanitize(action)})
            .then(function (authorisation) {
                if(authorisation && authorisation.roles){
                    return authorisation.roles;
                }
                return [];
            });
    }


})();