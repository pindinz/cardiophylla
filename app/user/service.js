(function () {
    'use strict';

    const crypto = require('crypto');
    const authorisationService = require('../authorisation/service');
    const SYSTEM_ROLES = require('../authorisation/systemRoles');
    const GENERAL_ACTIONS = require('./authorisation').GENERAL_ACTIONS;
    const repository = require('./repository');
    const STATUS = require('./status');

    const USER_INVITATION_SECRET = process.env.USER_INVITATION_SECRET || crypto.randomBytes(256).toString('hex');
    const USER_INVITATION_VALIDITY_DURATION = process.env.USER_INVITATION_VALIDITY_DURATION || 24 * 3600; // seconds
    const USER_INVITATION_HASH_FUNCTION = 'SHA256';

    module.exports = {
        createInvitation: createInvitation,
        acceptInvitation: acceptInvitation,
        update: update,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll,
        grantAuthorisation: grantAuthorisation,
        revokeAuthorisation: revokeAuthorisation,
        getAuthorisation: getAuthorisation,
        USER_INVITATION_VALIDITY_DURATION: USER_INVITATION_VALIDITY_DURATION
    };

    function createInvitation(email, roles, validUntil = Date.now() + 1000 * USER_INVITATION_VALIDITY_DURATION) {
        if (authorisationService.isAuthorised(GENERAL_ACTIONS.INVITE_USER, roles)) {
            const payload = Buffer.from(email).toString('base64') + ':' + Buffer.from(String(validUntil)).toString('base64');
            let hmac = crypto.createHmac(USER_INVITATION_HASH_FUNCTION, USER_INVITATION_SECRET);
            hmac.update(payload);
            const hash = hmac.digest('base64');
            return Promise.resolve(payload + ':' + hash);
        }
        return Promise.reject(new Error('INVITE_USER_NOT_AUTHORISED'));
    }

    function acceptInvitation(invitation) {
        if (!invitation) {
            return Promise.reject(new Error('USER_INVITATION_INVALID'));
        }
        const invitationParts = invitation.split(':');
        if (invitationParts.length !== 3) {
            return Promise.reject(new Error('USER_INVITATION_INVALID'));
        }
        let hmac = crypto.createHmac(USER_INVITATION_HASH_FUNCTION, USER_INVITATION_SECRET);
        hmac.update(invitationParts[0] + ':' + invitationParts[1]);
        const validationHash = hmac.digest('base64');
        const invitationHash = invitationParts[2];
        if (validationHash === invitationHash) {
            const validUntil = Number(Buffer.from(invitationParts[1], 'base64').toString());
            let now = Date.now();
            if (validUntil < now) {
                return Promise.reject(new Error('USER_INVITATION_EXPIRED'));
            }
            const user = {email: Buffer.from(invitationParts[0], 'base64').toString()};
            return repository.create(user);
        }
        return Promise.reject(new Error('USER_INVITATION_INVALID'));
    }

    function update(user, roles) {
        return ensureAdmin(user)
            .then(function () {
                ensureUniqueRoles(user);
                return repository.update(user, roles);
            });
    }

    function loadById(id, roles, withCredentials) {
        return repository.loadById(id, roles, withCredentials);
    }

    function loadByEmail(email, roles, withCredentials) {
        return repository.loadByEmail(email, roles, withCredentials);
    }

    function loadAll(roles) {
        return repository.loadAll(roles);
    }

    function grantAuthorisation(user, roles, action, role) {
        return repository.grantAuthorisation(user, roles, action, role);
    }

    function revokeAuthorisation(user, roles, action, role) {
        return repository.revokeAuthorisation(user, roles, action, role);
    }

    function getAuthorisation(user, roles) {
        return repository.getAuthorisation(user, roles);
    }


    function ensureUniqueRoles(user) {
        if (user && user.roles) {
            for (let i = user.roles.length - 1; i >= 0; i--) {
                if (user.roles.indexOf(user.roles[i]) < i) {
                    user.roles.splice(i, 1);
                }
            }
        }
    }

    function ensureAdmin(user) {
        if (user.status && user.status === STATUS.ACTIVE
            && user.roles && user.roles.indexOf(SYSTEM_ROLES.ADMIN) > -1) {
            return Promise.resolve(true);
        }
        return repository.loadActiveAdminIds()
            .then(function (adminIds) {
                if (adminIds.length > 1) {
                    return true;
                }
                if (adminIds.length === 1 && adminIds[0] !== user.id) {
                    return true;
                }
                return Promise.reject(new Error('ONE_ACTIVE_ADMIN_USER_REQUIRED'));
            });
    }

})();