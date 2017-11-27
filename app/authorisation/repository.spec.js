(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    const should = chai.should();

    const mongooseHelper = require('../../test/mongooseHelper');
    const authorisationRepository = require('./repository');


    describe('AuthorisationRepository', function () {

        beforeEach(function () {
            return mongooseHelper.setUp();
        });

        afterEach(function () {
            return mongooseHelper.tearDown();
        });

        describe('#addRoleToAction()', function () {
            it('should create a new authorisation and add the first role', function () {
                    return authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                        .then(function (authorisation) {
                            authorisation.should.have.property('action', 'TestAction');
                            authorisation.action.should.equal('TestAction');
                            authorisation.should.have.property('roles');
                            authorisation.roles.should.deep.equal(['TestRole']);
                        });
                }
            );
            it('should create a new authorisation and add two roles', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property('action');
                        authorisation.action.should.equal('TestAction');
                        authorisation.should.have.property('roles');
                        authorisation.roles.should.deep.equal(['TestRole1', 'TestRole2']);
                    });
            });
            it('should add a role only once, even if called twice with the same role', function () {
                authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole');
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property('action', 'TestAction');
                        authorisation.action.should.equal('TestAction');
                        authorisation.should.have.property('roles');
                        authorisation.roles.should.deep.equal(['TestRole']);
                    });
            });
        });

        describe('#removeRoleFromAction()', function () {
            it('should remove a role that is present in the action', function () {
                    return authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                        .then(function () {
                            return authorisationRepository.removeRoleFromAction('TestAction', 'TestRole');
                        })
                        .then(function (authorisation) {
                            authorisation.should.have.property('action');
                            authorisation.action.should.equal('TestAction');
                            authorisation.should.have.property('roles');
                            authorisation.roles.should.deep.equal([]);
                        });
                }
            );
            it('should do nothing if a role is tried to be removed and it is not present in the action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationRepository.removeRoleFromAction('TestAction', 'UnknownRole');
                    })
                    .then(function (authorisation) {
                        authorisation.should.have.property('action');
                        authorisation.action.should.equal('TestAction');
                        authorisation.should.have.property('roles');
                        authorisation.roles.should.deep.equal(['TestRole']);
                    });
            });
            it('should do nothing when trying to remove a role from a nonexistent action', function () {
                //todo
                authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationRepository.removeRoleFromAction('UnknownAction', 'TestRole');
                    })
                    .then(function (authorisation) {
                        should.not.exist(authorisation);
                    });
            });
        });

        describe('#countActionWithRole()', function () {
            it('should return true if a role is authorised for an action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationRepository.countActionWithRole('TestAction', ['TestRole']);
                    })
                    .then(function (isAllowed) {
                        isAllowed.should.equal(1);
                    });
            });
            it('should return true if a role among many is authorised for an action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function () {
                        return authorisationRepository.countActionWithRole('TestAction', ['TestRole1']);
                    })
                    .then(function (isAllowed) {
                        isAllowed.should.equal(1);
                    });
            });
            it('should return false if a role is not authorised for an action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole')
                    .then(function () {
                        return authorisationRepository.countActionWithRole('TestAction', ['TestRoleWithoutAuthorisation']);
                    })
                    .then(function (isAllowed) {
                        isAllowed.should.to.equal(0);
                    });
            });
            it('should return false if a role among many is not authorised for an action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function () {
                        return authorisationRepository.countActionWithRole('TestAction', ['TestRoleWithoutAuthorisation']);
                    })
                    .then(function (isAllowed) {
                        isAllowed.should.to.equal(0);
                    });
            });
        });

        describe('#loadActionRoles', function () {
            it('should return the roles for a given and existing action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function () {
                        return authorisationRepository.loadActionRoles('TestAction');
                    })
                    .then(function (roles) {
                        roles.should.deep.equal(['TestRole1', 'TestRole2']);
                    });
            });
            it('should return an empty array for a non-existing action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function () {
                        return authorisationRepository.loadActionRoles('NonExistingAction');
                    })
                    .then(function (roles) {
                        roles.should.deep.equal([]);
                    });
            });
            it('should throw an error for a maliciously crafted action', function () {
                return authorisationRepository.addRoleToAction('TestAction', 'TestRole1')
                    .then(function () {
                        return authorisationRepository.addRoleToAction('TestAction', 'TestRole2');
                    })
                    .then(function () {
                        return authorisationRepository.loadActionRoles({$ne: ''});
                    })
                    .catch(function (err) {
                        err.should.not.be.null;
                    });
            });
        });
    });


})();