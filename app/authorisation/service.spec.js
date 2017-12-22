(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    chai.should();
    const sinon = require('sinon');
    const sandbox = sinon.createSandbox();

    const authorisationRepository = require('./repository');
    const authorisationService = require('./service');


    beforeEach(function () {

    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('AuthorisationService', function () {

        describe('#grantAuthorisation()', function () {
            it('should create a new authorisation and add the first role', function () {
                    sandbox.stub(authorisationRepository, 'addRoleToAction').resolves({
                        action: 'TestAction',
                        roles: ['TestRole']
                    });
                    return authorisationService.grantAuthorisation('TestAction', 'TestRole')
                        .then(function (authorisation) {
                            authorisation.should.have.property('action', 'TestAction');
                            authorisation.action.should.equal('TestAction');
                            authorisation.should.have.property('roles');
                            authorisation.roles.should.deep.equal(['TestRole']);
                        });

                }
            );

            it('should create a new authorisation and add two roles', function () {
                sandbox.stub(authorisationRepository, 'addRoleToAction')
                    .onFirstCall().resolves({
                    action: 'TestAction',
                    roles: ['TestRole1']
                })
                    .onSecondCall().resolves({
                    action: 'TestAction',
                    roles: ['TestRole1', 'TestRole2']
                });
                return authorisationService.grantAuthorisation('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationService.grantAuthorisation('TestAction', 'TestRole2');
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property('action');
                        authorisation.action.should.equal('TestAction');
                        authorisation.should.have.property('roles');
                        authorisation.roles.should.deep.equal(['TestRole1', 'TestRole2']);
                    });

            });
            it('should add a role only once, even if called twice with the same role', function () {
                sandbox.stub(authorisationRepository, 'addRoleToAction').resolves({
                    action: 'TestAction',
                    roles: ['TestRole']
                });
                return authorisationService.grantAuthorisation('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationService.grantAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property('action', 'TestAction');
                        authorisation.action.should.equal('TestAction');
                        authorisation.should.have.property('roles');
                        authorisation.roles.should.deep.equal(['TestRole']);
                    });
            });
        });

        describe('#isAuthorised()', function () {
            it('should resolve with true if a role has the permission for an action', function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(1);
                return authorisationService.isAuthorised('TestAction', 'TestRole')
                    .then(function (isAllowed) {
                        isAllowed.should.be.true;
                    });
            });
            it('should resolve with true if a role among many has the permission for an action', function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(1);
                return authorisationService.isAuthorised('TestAction', 'TestRole1')
                    .then(function (isAllowed) {
                        isAllowed.should.be.true;
                    });
            });
            it('should resolve with false if a role does not have the permission for an action', function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(0);
                return authorisationService.isAuthorised('TestAction', 'TestRoleWithoutPermission')
                    .then(function (isAllowed) {
                        isAllowed.should.be.false;
                    });
            });
            it('should resolve with false if a role among many does not have the permission for an action', function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(0);
                authorisationService.isAuthorised('TestAction', 'TestRoleWithoutPermission')
                    .then(function (isAllowed) {
                        isAllowed.should.be.false;
                    });
            });
        });

        describe('#revokeAuthorisation', function () {
            it('should revoke the authorisation if it was given before', function () {
                    const stub = sandbox.stub(authorisationRepository, 'removeRoleFromAction').resolves({
                        action: 'TestAction',
                        roles: []
                    });
                    return authorisationService.revokeAuthorisation('TestAction', 'TestRole')
                        .then(function (authorisation) {
                            authorisation.should.have.property('action', 'TestAction');
                            authorisation.action.should.equal('TestAction');
                            authorisation.should.have.property('roles');
                            authorisation.roles.should.deep.equal([]);
                            stub.should.have.been.calledWith('TestAction', 'TestRole');
                        });

                }
            );
        });
    });

})();