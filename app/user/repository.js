(function () {
    'use strict';

    const mongoose = require('mongoose');
    const sanitize = require('mongo-sanitize');

    const ENTITY_ACTIONS = require('./authorisation').ENTITY_ACTIONS;
    const STATUS = require('./status');
    const SYSTEM_ROLES = require('../authorisation/systemRoles');
    const AUTHORISATION_FIELD_NAME = require('../authorisation/authorisationPluginFieldName');

    const DEFAULT_PROJECTION = '_id email status name roles';
    const FULL_PROJECTION = DEFAULT_PROJECTION + ' passwordHash passwordSalt';


    module.exports = {
        create: create,
        update: update,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll,
        loadActiveAdminIds: loadActiveAdminIds,
        grantAuthorisation: grantAuthorisation,
        revokeAuthorisation: revokeAuthorisation,
        getAuthorisation: getAuthorisation
    };


    const userSchema = mongoose.Schema({
        email: {type: String, required: true, unique: true},
        passwordHash: {type: Buffer, required: true},
        passwordSalt: {type: Buffer, required: true},
        status: {type: String, default: STATUS.ACTIVE, enum: Object.values(STATUS)},
        name: {type: String},
        roles: {type: [String]}
    });
    userSchema.plugin(require('../authorisation/authorisationSchemaPlugin'), Object.values(ENTITY_ACTIONS));

    const User = mongoose.model('User', userSchema);


    function create(user) {
        const userDoc = new User(user);
        return userDoc.save()
            .then(function (dbUser) {
                return createObject(dbUser);
            });
    }

    function update(user, roles) {
        return User
            .findOne({_id: sanitize(user.id)})
            .isAuthorisedOne(ENTITY_ACTIONS.UPDATE, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    if (user.email) {
                        dbUser.email = user.email;
                    }
                    if (user.name) {
                        dbUser.name = user.name;
                    }
                    if (user.passwordSalt) {
                        dbUser.passwordSalt = user.passwordSalt;
                    }
                    if (user.passwordHash) {
                        dbUser.passwordHash = user.passwordHash;
                    }
                    if (user.status) {
                        dbUser.status = user.status;
                    }
                    if (user.roles) {
                        dbUser.roles = user.roles;
                    }
                    return dbUser.save();
                }
                return handleReject({_id: sanitize(user.id)}, 'UPDATE_USER');
            })
            .then(function (userDoc) {
                return createObject(userDoc);
            });
    }

    function loadById(id, roles, withCredentials) {
        return User
            .findOne({_id: sanitize(id)}, prepareProjection(withCredentials))
            .isAuthorisedOne(ENTITY_ACTIONS.READ, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return createObject(dbUser);
                }
                return handleReject({_id: sanitize(id)}, 'READ_USER');
            });
    }

    function loadByEmail(email, roles, withCredentials) {
        return User
            .findOne({email: sanitize(email)}, prepareProjection(withCredentials))
            .isAuthorisedOne(ENTITY_ACTIONS.READ, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return createObject(dbUser);
                }
                return handleReject({email: sanitize(email)}, 'READ_USER');
            });
    }

    function loadAll(roles) {
        return User
            .find({}, DEFAULT_PROJECTION)
            .isAuthorised(ENTITY_ACTIONS.READ, roles)
            .exec()
            .then(function (dbUserList) {
                return dbUserList.map(createObject);
            })
    }

    function loadActiveAdminIds() {
        let query = {
            status: STATUS.ACTIVE,
            roles: {
                $in: [SYSTEM_ROLES.ADMIN]
            }
        };
        return User.find(query, '_id')
            .then(function (docs) {
                return docs.map(function (doc) {
                    return doc._id;
                })
            });
    }

    function grantAuthorisation(user, roles, action, role) {
        return User
            .findOne({_id: sanitize(user.id)})
            .isAuthorisedOne(ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return dbUser.grantAuthorisation(action, role);
                }
                return handleReject({_id: sanitize(user.id)}, 'GRANT_USER_AUTHORISATION');
            })
            .then(function (dbUser) {
                return createObject(dbUser);
            });
    }

    function revokeAuthorisation(user, roles, action, role) {
        return User
            .findOne({_id: sanitize(user.id)})
            .isAuthorisedOne(ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return dbUser.revokeAuthorisation(action, role);
                }
                return handleReject({_id: sanitize(user.id)}, 'REVOKE_USER_AUTHORISATION');
            })
            .then(function (dbUser) {
                return createObject(dbUser);
            });
    }

    function getAuthorisation(user, roles) {
        return User
            .findOne({_id: sanitize(user.id)})
            .isAuthorisedOne(ENTITY_ACTIONS.READ, roles)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return dbUser.getAuthorisation();
                }
                return handleReject({_id: sanitize(user.id)}, 'GET_USER_AUTHORISATION');
            });
    }

    function createObject(dbUser) {
        let user = {
            id: dbUser._id,
            email: dbUser.email,
            status: dbUser.status,
            name: dbUser.name,
            roles: dbUser.roles
        };
        if (dbUser.passwordHash) {
            user.passwordHash = dbUser.passwordHash;
        }
        if (dbUser.passwordSalt) {
            user.passwordSalt = dbUser.passwordSalt;
        }
        return user;
    }

    function handleReject(queryArgument, operation) {
        let notAuthorisedMessage = operation + '_NOT_AUTHORISED';
        let notFoundMessage = operation + '_NOT_FOUND';
        return User
            .findOne(queryArgument)
            .exec()
            .then(function (dbUser) {
                if (dbUser) {
                    return Promise.reject(new Error(notAuthorisedMessage));
                }
                return Promise.reject(new Error(notFoundMessage));
            });
    }

    function prepareProjection(withCredentials = false) {
        if (withCredentials) {
            return FULL_PROJECTION;
        }
        return DEFAULT_PROJECTION;
    }

})();