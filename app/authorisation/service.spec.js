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

    describe('AuthorisationService', function () {

        describe('#authorise()', function () {
            it('should create a new authorisation and add the first role', function () {
                    sandbox.stub(authorisationRepository, 'addRoleToAction').resolves({
                        action: 'TestAction',
                        roles: ['TestRole']
                    });
                    return authorisationService.authorise('TestAction', 'TestRole')
                        .then(function (authorisation) {
                            authorisation.should.have.property('action', 'TestAction');
                            authorisation.action.should.equal('TestAction');
                            authorisation.should.have.property('roles');
                            authorisation.roles.should.deep.equal(['TestRole']);
                        });

                }
            );

            it('should create a new permission and add two roles', function () {
                sandbox.stub(authorisationRepository, 'addRoleToAction')
                    .onFirstCall().resolves({
                    action: 'TestAction',
                    roles: ['TestRole1']
                })
                    .onSecondCall().resolves({
                    action: 'TestAction',
                    roles: ['TestRole1', 'TestRole2']
                });
                return authorisationService.authorise('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationService.authorise('TestAction', 'TestRole2');
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
                return authorisationService.authorise('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationService.authorise('TestAction', 'TestRole');
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
            it('should return true if a role has the permission for an action', async function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(1);
                const isAllowed = await authorisationService.isAuthorised('TestAction', 'TestRole');
                isAllowed.should.be.true;
            });
            it('should return true if a role among many has the permission for an action', async function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(1);
                const isAllowed = await authorisationService.isAuthorised('TestAction', 'TestRole1');
                isAllowed.should.be.true;
            });
            it('should return false if a role does not have the permission for an action', async function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(0);
                const isAllowed = await authorisationService.isAuthorised('TestAction', 'TestRoleWithoutPermission');
                isAllowed.should.be.false;
            });
            it('should return false if a role among many does not have the permission for an action', async function () {
                sandbox.stub(authorisationRepository, 'countActionWithRole').resolves(0);
                const isAllowed = await authorisationService.isAuthorised('TestAction', 'TestRoleWithoutPermission');
                isAllowed.should.be.false;
            });
        });
    });


    afterEach(function () {
        sandbox.restore();
    });

})();