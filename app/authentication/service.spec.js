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
            it('should return false if no credentials are passed', function () {
                const authenticated = authenticationService.authenticate(null, 'xyz');
                authenticated.should.be.false;
            });
        });

        describe('#createPasswordHash', function () {
            it('should return a buffer of 512 bytes', function () {
                const hash = authenticationService.createPasswordHash('abc', Buffer('abc'));
                hash.should.be.a('Uint8Array');
                hash.byteLength.should.equal(512);
            });
            it('should throw a ReferenceError if no salt is provided', function () {
                (function () {
                    authenticationService.createPasswordHash('', null)
                }).should.throw('Invalid salt value');
            });
        });

        describe('#createPasswordSalt', function () {
           it('should return a buffer of 256 bytes', function () {
              const salt = authenticationService.createPasswordSalt();
              salt.should.be.a('Uint8Array');
              salt.byteLength.should.equal(256);
           });
        });

    });


})();