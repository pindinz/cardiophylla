(function () {
    'use strict';

    const crypto = require('crypto');


    const PBKDF2_ITERATIONS = 100000;
    const SALT_SIZE = 256;
    const PASSWORD_HASH_LENGTH = 512;

    module.exports = {
        authenticate: authenticate,
        createPasswordHash: createPasswordHash,
        createPasswordSalt: createPasswordSalt
    };

    function authenticate(credentials) {

        if (credentials && credentials.status && credentials.password && credentials.passwordHash && credentials.passwordSalt) {

            if (credentials.status === 'ACTIVE') {
                const passwordHash = createPasswordHash(credentials.password, credentials.passwordSalt);
                if (crypto.timingSafeEqual(passwordHash, credentials.passwordHash)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    function createPasswordHash(password, salt) {

        if (!salt) {
            throw new ReferenceError('Invalid salt value');
        }

        const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PASSWORD_HASH_LENGTH, 'sha512');
        return new Buffer(hash);

    }

    function createPasswordSalt() {
        return crypto.randomBytes(SALT_SIZE);
    }

})();