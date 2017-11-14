(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    const crypto = require('crypto');
    chai.should();
    const sinon = require('sinon');
    const sandbox = sinon.createSandbox();

    const authenticationService = require('./service');

    describe('AuthenticationService', function () {

        afterEach(function () {
            sandbox.restore();
        });

        describe('#authenticate()', function () {
            it('should return the user if the user is ACTIVE and the password is valid', function () {
                sandbox.stub(crypto, 'timingSafeEqual').returns(true);
                const credentials = {status: 'ACTIVE', passwordHash: 'abc', passwordSalt: 'def'};
                const authenticated = authenticationService.authenticate(credentials, 'xyz');
                authenticated.should.be.true;
            });
            it('should return false if the user is not ACTIVE even if the password is valid', function () {
                sandbox.stub(crypto, 'timingSafeEqual').returns(true);
                const user = {status: 'INACTIVE', passwordHash: 'abc', passwordSalt: 'def'};
                const authenticated = authenticationService.authenticate(user, 'xyz');
                authenticated.should.be.false;
            });
            it('should return false if the user is ACTIVE and the password is invalid', function () {
                sandbox.stub(crypto, 'timingSafeEqual').returns(false);
                const user = {status: 'ACTIVE', passwordHash: 'abc', passwordSalt: 'def'};
                const authenticated = authenticationService.authenticate(user, 'xyz');
                authenticated.should.be.false;
            });
        });

    });


})();