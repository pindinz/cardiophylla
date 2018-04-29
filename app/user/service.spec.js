(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    chai.should();
    const sinon = require('sinon');
    const sandbox = sinon.createSandbox();
    const authorisationService = require('../authorisation/service');
    const userRepository = require('./repository');
    const userService = require('./service');
    const STATUS = require('./status');
    const SYSTEM_ROLES = require('../authorisation/systemRoles');
    const AUTHORISATION_FIELD_NAME = require('../authorisation/authorisationPluginFieldName');
    const USER_ENTITY_ACTIONS = require('./authorisation').ENTITY_ACTIONS;


    beforeEach(function () {

    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('UserService', function () {

        describe('#createInvitation()', function () {
            it('should create a new invitation', function () {
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                return userService.createInvitation('test@example.com', ['TestRole'])
                    .then(function (invitation) {
                        invitation.should.be.a('string');
                        invitation.should.match(/[A-Za-z0-9+/]+[=]*:[A-Za-z0-9+/]+[=]*:[A-Za-z0-9+/]+[=]*/);
                    });

            });
            it('should return a rejected promise if the user is not authorised', function () {
                sandbox.stub(authorisationService, 'isAuthorised').returns(false);
                return userService.createInvitation('test@example.com', ['TestRole'])
                    .catch(function (err) {
                        err.should.be.an('Error');
                        err.message.should.equal('INVITE_USER_NOT_AUTHORISED');
                    });

            });
        });

        describe('#acceptInvitation()', function () {
            it('should create a new user if a valid invitation is passed and return it as promise', function () {
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let userRepoStub = sandbox.stub(userRepository, 'create').resolves({email: 'test@example.com'});
                return userService.createInvitation('test@example.com', ['TestRole'])
                    .then(function (invitation) {
                        return userService.acceptInvitation(invitation);
                    })
                    .then(function (user) {
                        user.email.should.equal('test@example.com');
                        userRepoStub.should.have.been.calledOnce;
                    });
            });
            it('should return a rejected promise if the invitation is falsy', function () {
                return userService.acceptInvitation('')
                    .catch(function (err) {
                        err.should.be.an('Error');
                        err.message.should.equal('USER_INVITATION_INVALID');
                    });

            });
            it('should return a rejected promise if the invitation does not contain 3 parts separated by colon', function () {
                return userService.acceptInvitation('a:b')
                    .catch(function (err) {
                        err.should.be.an('Error');
                        err.message.should.equal('USER_INVITATION_INVALID');
                    });

            });
            it('should return a rejected promise if the invitation has been tampered with', function () {
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                return userService.createInvitation('test@example.com', ['TestRole'])
                    .then(function (invitation) {
                        let tamperedInvitation = Buffer.from('tampered@example.com').toString('base64') + invitation.substr(invitation.indexOf(':'));
                        return userService.acceptInvitation(tamperedInvitation);
                    })
                    .catch(function (err) {
                        err.should.be.an('Error');
                        err.message.should.equal('USER_INVITATION_INVALID');
                    });
            });
            it('should return a rejected promise if the invitation has expired', function () {
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                return userService.createInvitation('test@example.com', ['TestRole'], Date.now() - 1)
                    .then(function (invitation) {
                        return userService.acceptInvitation(invitation);
                    })
                    .catch(function (err) {
                        err.should.be.an('Error');
                        err.message.should.equal('USER_INVITATION_EXPIRED');
                    });
            });
        });

        describe('#update()', function () {
            it('should update an existing user who is not admin but another admin exists', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let repositoryStub = sandbox.stub(userRepository, 'update')
                    .callsFake(function (user) {
                        return user;
                    });
                sandbox.stub(userRepository, 'loadActiveAdminIds').resolves(['5a21ee3abfaaaa19cadb1976']);
                return userService.update(testUser, ['TestRole'])
                    .then(function (user) {
                        repositoryStub.should.have.been.deep.calledWith(testUser);
                        user.should.deep.equal(testUser);
                    });

            });
            it('should update an existing user who is admin', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.ADMIN]
                };
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let repositoryStub = sandbox.stub(userRepository, 'update')
                    .callsFake(function (user) {
                        return user;
                    });
                sandbox.stub(userRepository, 'loadActiveAdminIds').resolves(['5a21ee3abfaaaa19cadb1976']);
                return userService.update(testUser, ['TestRole'])
                    .then(function (user) {
                        repositoryStub.should.have.been.deep.calledWith(testUser);
                        user.should.deep.equal(testUser);
                    });

            });
            it('should update an existing user who is not admin but several other admins exists', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let repositoryStub = sandbox.stub(userRepository, 'update')
                    .callsFake(function (user) {
                        return user;
                    });
                sandbox.stub(userRepository, 'loadActiveAdminIds').resolves(['5a21ee3abfaaaa19cadb2013', '5a21ee3abfaaaa19cadb2016']);
                return userService.update(testUser, ['TestRole'])
                    .then(function (user) {
                        repositoryStub.should.have.been.deep.calledWith(testUser);
                        user.should.deep.equal(testUser);
                    });

            });
            it('should not update an existing user who is no longer admin and no other admins exists', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let repositoryStub = sandbox.stub(userRepository, 'update')
                    .callsFake(function (user) {
                        return user;
                    });
                sandbox.stub(userRepository, 'loadActiveAdminIds').resolves(['5a21ee3abfaaaa19cadb4661']);
                return userService.update(testUser, ['TestRole'])
                    .catch(function (err) {
                        err.should.be.an('Error');
                        repositoryStub.should.not.have.been.called;
                    });

            });
            it('should update an existing user and remove repeated roles', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER, SYSTEM_ROLES.USER, SYSTEM_ROLES.USER]
                };
                sandbox.stub(authorisationService, 'isAuthorised').returns(true);
                let repositoryStub = sandbox.stub(userRepository, 'update')
                    .callsFake(function (user) {
                        return user;
                    });
                repositoryStub.resolves(testUser);
                sandbox.stub(userRepository, 'loadActiveAdminIds').resolves(['5a21ee3abfaaaa19cadb1976']);
                return userService.update(testUser, ['TestRole'])
                    .then(function (user) {
                        user.roles.should.have.lengthOf(1);
                    });

            });
        });

        describe('#loadById()', function () {
            it('should load the user by its id', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                testUser[AUTHORISATION_FIELD_NAME] = {};
                testUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, 'TestRole'];
                let repositoryStub = sandbox.stub(userRepository, 'loadById');
                repositoryStub.resolves(testUser);
                return userService.loadById('5a21ee3abfaaaa19cadb4661', ['TestRole'])
                    .then(function (user) {
                        repositoryStub.should.have.been.deep.calledWith('5a21ee3abfaaaa19cadb4661');
                        user.should.deep.equal(testUser);
                    });
            });
        });

        describe('#loadByEmail()', function () {
            it('should load the user by its email', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                testUser[AUTHORISATION_FIELD_NAME] = {};
                testUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, 'TestRole'];
                let repositoryStub = sandbox.stub(userRepository, 'loadByEmail');
                repositoryStub.resolves(testUser);
                return userService.loadByEmail('test@example.com', ['TestRole'])
                    .then(function (user) {
                        repositoryStub.should.have.been.deep.calledWith('test@example.com');
                        user.should.deep.equal(testUser);
                    });
            });
        });

        describe('#loadAll()', function () {
            it('should load all users', function () {
                const testUser = {
                    id: '5a21ee3abfaaaa19cadb4661',
                    email: 'test@example.com',
                    name: 'Test',
                    status: STATUS.ACTIVE,
                    passwordSalt: 'password_salt',
                    passwordHash: 'password_hash',
                    roles: [SYSTEM_ROLES.USER]
                };
                testUser[AUTHORISATION_FIELD_NAME] = {};
                testUser[AUTHORISATION_FIELD_NAME][USER_ENTITY_ACTIONS.READ] = [SYSTEM_ROLES.ADMIN, 'TestRole'];
                let repositoryStub = sandbox.stub(userRepository, 'loadAll');
                repositoryStub.resolves([testUser, testUser]);
                return userService.loadAll(['TestRole'])
                    .then(function (userList) {
                        repositoryStub.should.have.been.deep.calledOnce;
                        userList.should.deep.equal([testUser, testUser]);
                    });
            });
        });

    });

})();