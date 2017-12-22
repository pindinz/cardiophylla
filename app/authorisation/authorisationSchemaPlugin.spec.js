(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    chai.should();
    const sinon = require('sinon');
    const sinonChai = require('sinon-chai');
    chai.use(sinonChai);
    const mongoose = require('mongoose');
    const mongooseHelper = require('../../test/mongooseHelper');
    let authorisationSchemaPlugin;// = require('./authorisationSchemaPlugin');


    describe('AuthorisationSchemaPlugin', function () {

        beforeEach(function () {
            authorisationSchemaPlugin = require('./authorisationSchemaPlugin');
            return mongooseHelper.setUp();
        });

        afterEach(function () {
            return mongooseHelper.tearDown();
        });

        describe('AuthorisationSchemaPlugin and Queries', function () {

            it('should build the right sub-document structure and add it to the schema', function () {
                let TestSchema = new mongoose.Schema({name: String});
                const spy = sinon.spy(TestSchema, 'add');
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction1', 'TestAction2']);
                spy.should.have.been.deep.calledWith({
                    _authorisation: {
                        TestAction1: {type: [String], index: true},
                        TestAction2: {type: [String], index: true}
                    }
                });
            });

            it('should resolve with an empty query result if the document has no matching role', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel({name: 'TestName'});

                return testData.update()
                    .then(function () {
                        return TestModel
                            .find({})
                            .isAuthorised('TestAction', ['TestRole'])
                            .exec();
                    })
                    .then(function (result) {
                        result.should.be.an('Array');
                        result.should.be.length(0);
                    });
            });

            it('should resolve with a result if the document has a matching role that is granted authorisation on the specified action', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel(
                    {
                        name: 'TestName',
                        _authorisation:
                            {TestAction: ['TestRole']}
                    });

                return testData.save()
                    .then(function () {
                        return TestModel
                            .find({})
                            .isAuthorised('TestAction', ['TestRole'])
                            .exec();
                    })
                    .then(function (result) {
                        result.should.be.an('Array');
                        result.should.be.length(1);
                    });
            });

        });

        describe('#grantAuthorisation()', function () {

            it('should resolve with the correct authorisation data with the document', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel({name: 'TestName'});

                return testData.save()
                    .then(function (testData) {
                        return testData.grantAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (result) {
                        result.should.have.property('_authorisation');
                        result._authorisation.should.have.property('TestAction');
                        result._authorisation.TestAction.should.deep.equal(['TestRole']);
                    })
            });

            it('should resolve with the correct authorisation data with the document if called twice', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel({name: 'TestName'});

                return testData.save()
                    .then(function (testData) {
                        return testData.grantAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (testData) {
                        return testData.grantAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (result) {
                        result.should.have.property('_authorisation');
                        result._authorisation.should.have.property('TestAction');
                        result._authorisation.TestAction.should.deep.equal(['TestRole']);
                    })
            });

        });

        describe('#revokeAuthorisation()', function () {

            it('should resolve with no authorisation after removing the only one', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel(
                    {
                        name: 'TestName',
                        _authorisation:
                            {TestAction: ['TestRole']}
                    });

                return testData.save()
                    .then(function (result) {
                        return result.revokeAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (result) {
                        result.should.have.property('_authorisation');
                        result._authorisation.should.have.property('TestAction');
                        result._authorisation.TestAction.should.deep.equal([]);
                    });
            });

            it('should resolve with no authorisation after removing the only one twice', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel(
                    {
                        name: 'TestName',
                        _authorisation:
                            {TestAction: ['TestRole']}
                    });

                return testData.save()
                    .then(function (result) {
                        return result.revokeAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (result) {
                        return result.revokeAuthorisation('TestAction', 'TestRole');
                    })
                    .then(function (result) {
                        result.should.have.property('_authorisation');
                        result._authorisation.should.have.property('TestAction');
                        result._authorisation.TestAction.should.deep.equal([]);
                    });
            });

        });

        describe('#getAuthorisation()', function () {

            it('should resolve with the authorisation object for the document', function () {
                let TestSchema = new mongoose.Schema({name: String});
                TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
                let TestModel = mongoose.model('TestModel', TestSchema);
                const testData = new TestModel(
                    {
                        name: 'TestName',
                        _authorisation:
                            {TestAction: ['TestRole']}
                    });

                return testData.save()
                    .then(function (result) {
                        const authorisation = result.getAuthorisation();
                        authorisation.should.have.property('TestAction');
                        authorisation.TestAction.should.deep.equal(['TestRole']);
                    });
            });

        });

    });


})();