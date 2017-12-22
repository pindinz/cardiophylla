(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    chai.should();
    const mongooseHelper = require('../../test/mongooseHelper');
    const SYSTEM_ROLES = require('../authorisation/systemRoles');
    const AUTHORISATION_FIELD_NAME = require('../authorisation/authorisationPluginFieldName');
    let userRepository;
    const STATUS = require('./status');
    const USER_ENTITY_ACTIONS = require('./authorisation').ENTITY_ACTIONS;


    describe('UserRepository', function () {

        beforeEach(function () {
            userRepository = require('./repository');
            return mongooseHelper.setUp();
        });

        afterEach(function () {
            return mongooseHelper.tearDown();
        });

        describe('#create()', function () {
            it('should create a new user', function () {
                let user = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                return userRepository.create(user)
                    .then(function (createdUser) {
                        createdUser.should.have.property('id');
                        createdUser.id.should.not.be.null;
                        createdUser.email.should.equal(user.email);
                        createdUser.passwordHash.should.deep.equal(user.passwordHash);
                        createdUser.passwordSalt.should.deep.equal(user.passwordSalt);
                        createdUser.name.should.equal(user.name);
                        createdUser.status.should.equal(user.status);
                        createdUser.roles.should.deep.equal(user.roles);
                    });
            });
        });

        describe('#update()', function () {
            it('should update all fields of an existing user', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (user) {
                        user.name = 'Updated';
                        return userRepository.update(user, [SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (updatedUser) {
                        updatedUser.name.should.equal('Updated');
                    });
            });
            it('should not update the existing user and return a rejected promise if the logged-in user is not authorised', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (user) {
                        user.name = 'Updated';
                        return userRepository.update(user, [SYSTEM_ROLES.USER]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('UPDATE_USER_NOT_AUTHORISED');
                    });
            });
            it('should return a rejected promise if the user does not exist (has no id)', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (user) {
                        user.id = null;
                        user.name = 'Updated';
                        return userRepository.update(user, [SYSTEM_ROLES.ADMIN]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('UPDATE_USER_NOT_FOUND');
                    });
            });
        });

        describe('#loadById()', function () {
            it('should load an existing user by its id if the logged-in user is authorised', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.loadById(createdUser.id, [SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (loadedUser) {
                        loadedUser.email.should.equal('test@example.com');
                    });
            });
            it('should load an existing user inclusive passwordHash and passwordSalt by its id if the logged-in user is authorised and withCredentials is true', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.loadById(createdUser.id, [SYSTEM_ROLES.ADMIN], true);
                    })
                    .then(function (loadedUser) {
                        loadedUser.should.have.property('passwordHash');
                        loadedUser.should.have.property('passwordSalt');
                    });
            });
            it('should return a rejected promise if the logged-in user is not authorised', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.loadById(createdUser.id, [SYSTEM_ROLES.USER]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('READ_USER_NOT_AUTHORISED');
                    });
            });
            it('should return a rejected promise if the user cannot be found with the specified id', function () {
                userRepository.loadById(null, [SYSTEM_ROLES.ADMIN])
                    .catch(function (err) {
                        err.message.should.equal('READ_USER_NOT_FOUND');
                    });
            });
        });

        describe('#loadByEmail()', function () {
            it('should load an existing user by its email if the logged-in user is authorised', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.loadByEmail(createdUser.email, [SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (loadedUser) {
                        loadedUser.email.should.equal('test@example.com');
                    });
            });
            it('should return a rejected promise if the logged-in user is not authorised', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.loadByEmail(createdUser.email, [SYSTEM_ROLES.USER]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('READ_USER_NOT_AUTHORISED');
                    });
            });
            it('should return a rejected promise if the user cannot be found with the specified id', function () {
                userRepository.loadByEmail('non-existing@example.org', [SYSTEM_ROLES.ADMIN])
                    .catch(function (err) {
                        err.message.should.equal('READ_USER_NOT_FOUND');
                    });
            });
        });

        describe('#loadAll()', function () {
            it('should load all users if the logged-in user is authorised to do so', function () {
                let newUser1 = {
                    email: 'test1@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test One',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser1[AUTHORISATION_FIELD_NAME] = {};
                newUser1[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                let newUser2 = {
                    email: 'test2@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test Two',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser2[AUTHORISATION_FIELD_NAME] = {};
                newUser2[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                return Promise.all([
                    userRepository.create(newUser1),
                    userRepository.create(newUser2)
                ])
                    .then(function () {
                        return userRepository.loadAll([SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (dbUsers) {
                        dbUsers.should.have.lengthOf(2);
                    });
            });
            it('should load all users for which the logged-in user is authorised to do so', function () {
                let newUser1 = {
                    email: 'test1@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test One',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser1[AUTHORISATION_FIELD_NAME] = {};
                newUser1[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                let newUser2 = {
                    email: 'test2@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test Two',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser2[AUTHORISATION_FIELD_NAME] = {};
                newUser2[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.USER];
                return Promise.all([
                    userRepository.create(newUser1),
                    userRepository.create(newUser2)
                ])
                    .then(function () {
                        return userRepository.loadAll([SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (dbUsers) {
                        dbUsers.should.have.lengthOf(1);
                    });
            });
        });

        describe('#loadActiveAdminIds()', function () {
            it('should return an array of all active admin ids', function () {
                let newUser1 = {
                    email: 'test1@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test One',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.ADMIN]
                };
                let newUser2 = {
                    email: 'test2@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test Two',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                let newUser3 = {
                    email: 'test2@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test Two',
                    status: STATUS.INACTIVE,
                    roles: [SYSTEM_ROLES.ADMIN]
                };
                return Promise.all([
                    userRepository.create(newUser1),
                    userRepository.create(newUser2),
                    userRepository.create(newUser3)
                ])
                    .then(function () {
                        return userRepository.loadActiveAdminIds();
                    })
                    .then(function (activeAdminIds) {
                        activeAdminIds.should.have.lengthOf(1);
                    })
            });
        });

        describe('#grantAuthorisation()', function () {
            it('should add the specified role to the specified action if the logged-in user is authorised to do so', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.grantAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .then(function (loadedUser) {
                        return userRepository.getAuthorisation(loadedUser, [SYSTEM_ROLES.ADMIN])
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property(USER_ENTITY_ACTIONS.READ);
                        authorisation[USER_ENTITY_ACTIONS.READ].should.deep.equal([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER]);
                    });
            });
            it('should reject with an error if the logged-in user is not authorised to grant authorisations', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.grantAuthorisation(createdUser, [SYSTEM_ROLES.USER], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .catch(function (err) {
                        err.message.should.equal('GRANT_USER_AUTHORISATION_NOT_AUTHORISED');
                    });
            });
            it('should reject with an error if the user does not exist', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        createdUser.id = null;
                        return userRepository.grantAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .catch(
                        function (err) {
                            err.message.should.equal('GRANT_USER_AUTHORISATION_NOT_FOUND');
                        }
                    );
            });
        });

        describe('#revokeAuthorisation()', function () {
            it('should add the specified role to the specified action if the logged-in user is authorised to do so', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.revokeAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .then(function (loadedUser) {
                        return userRepository.getAuthorisation(loadedUser, [SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property(USER_ENTITY_ACTIONS.READ);
                        authorisation[USER_ENTITY_ACTIONS.READ].should.deep.equal([SYSTEM_ROLES.ADMIN]);
                    });
            });
            it('should reject with an error if the logged-in user is not authorised to revoke authorisations', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.revokeAuthorisation(createdUser, [SYSTEM_ROLES.USER], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .catch(function (err) {
                        err.message.should.equal('REVOKE_USER_AUTHORISATION_NOT_AUTHORISED');
                    });
            });
            it('should reject with an error if the user does not exist', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.GRANT_REVOKE_AUTHORISATION] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        createdUser.id = null;
                        return userRepository.revokeAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN], USER_ENTITY_ACTIONS.READ, SYSTEM_ROLES.USER);
                    })
                    .catch(
                        function (err) {
                            err.message.should.equal('REVOKE_USER_AUTHORISATION_NOT_FOUND');
                        }
                    );
            });
        });

        describe('#getAuthorisation()', function () {
            it('should resolve with the user\'s authorisation', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.getAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN]);
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property(USER_ENTITY_ACTIONS.READ);
                        authorisation[USER_ENTITY_ACTIONS.READ].should.deep.equal([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER]);
                        authorisation.should.have.property(USER_ENTITY_ACTIONS.UPDATE);
                        authorisation[USER_ENTITY_ACTIONS.UPDATE].should.deep.equal([SYSTEM_ROLES.ADMIN]);
                    });
            });
            it('should reject with an error if the logged-in user is not authorised to get authorisations', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        return userRepository.getAuthorisation(createdUser, [SYSTEM_ROLES.GUEST]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('GET_USER_AUTHORISATION_NOT_AUTHORISED');
                    });
            });
            it('should reject with an error if the user does not exist', function () {
                let newUser = {
                    email: 'test@example.com',
                    passwordHash: Buffer.from('asdf'),
                    passwordSalt: Buffer.from('sdfg'),
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    roles: [SYSTEM_ROLES.USER]
                };
                newUser[AUTHORISATION_FIELD_NAME] = {};
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER];
                newUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.UPDATE] = [SYSTEM_ROLES.ADMIN];
                return userRepository.create(newUser)
                    .then(function (createdUser) {
                        createdUser.id = null;
                        return userRepository.getAuthorisation(createdUser, [SYSTEM_ROLES.ADMIN]);
                    })
                    .catch(function (err) {
                        err.message.should.equal('GET_USER_AUTHORISATION_NOT_FOUND');
                    });
            });
        });

    });

})();