(function () {
    'use strict';

    const mongoose = require('mongoose');

    module.exports = {
        addRoleToAction: addRoleToAction,
        countActionWithRole: countActionWithRole
    };

    const permissionSchema = mongoose.Schema({
        action: {type: String, unique: true},
        roles: {type: [String]}
    });

    const Authorisation = mongoose.model('Authorisation', permissionSchema);

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

        return Authorisation.findOneAndUpdate({action: action}, update, options);
    }

    function countActionWithRole(action, role) {
        return Authorisation.count({action: action, roles: {$in: [role]}});
    }


})();