(function () {
    'use strict';

    const crypto = require('crypto');


    const PBKDF2_ITERATIONS = 100000;
    const SALT_SIZE = 256;
    const PASSWORD_HASH_LENGTH = 512;


    function authenticate(user, password) {

        if (user && password) {

            if (user.status === 'ACTIVE') {
                var passwordHash = createPasswordHash(password, user.passwordSalt);
                if (crypto.timingSafeEqual(passwordHash, user.passwordHash)) {
                    return user;
                }
            }
            return false;
        }
    }

    function createPasswordHash(password, salt) {

        if (!salt) {
            throw new ReferenceError('Invalid salt value');
        }

        var hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PASSWORD_HASH_LENGTH, 'sha512');
        return new Buffer(hash);

    }

    function createPasswordSalt() {
        return crypto.randomBytes(SALT_SIZE);
    }


    module.exports = {
        authenticate: authenticate,
        createPasswordHash: createPasswordHash,
        createPasswordSalt: createPasswordSalt
    };

})();