(function () {
    'use strict';

    const chai = require("chai");
    const chaiAsPromised = require("chai-as-promised");
    chai.use(chaiAsPromised);
    chai.should();
    const sinon = require('sinon');
    const sinonChai = require('sinon-chai');
    chai.use(sinonChai);
    const sandbox = sinon.createSandbox();
    const mongoose = require('mongoose');

    const mongooseHelper = require('../../test/mongooseHelper');
    const authorisationSchemaPlugin = require('./authorisationSchemaPlugin');


    describe('AuthorisationSchemaPlugin', function () {

        beforeEach(function () {
            return mongooseHelper.setUp();
        });

        afterEach( function () {
            sandbox.restore();
            return mongooseHelper.tearDown();
        });

        it('should build the right sub-document structure and add it to the schema', function () {
            let TestSchema = new mongoose.Schema({name: String});
            const spy = sinon.spy(TestSchema, 'add');
            TestSchema.plugin(authorisationSchemaPlugin, ['TestAction1', 'TestAction2'])
            spy.should.have.been.deep.calledWith({
                _authorisation: {
                    TestAction1: {type: [String], index: true},
                    TestAction2: {type: [String], index: true}
                }
            });
        });

        it('should check the authorisation as part of the query', async function () {
            let TestSchema = new mongoose.Schema({name: String});
            TestSchema.plugin(authorisationSchemaPlugin, ['TestAction']);
            let TestModel = mongoose.model('TestModel', TestSchema);
            const testData = new TestModel({name: 'TestName'});
            testData.save();
            //const spy = sinon.spy(TestSchema.query, 'checkAuthorisation');
            await TestModel
                .find({})
                .checkAuthorisation('TestAction', ['TestRole'])
                .exec()
                .then(function (result) {
                    console.log(result);
                });
            //spy.should.have.been.calledWith('TestAction', ['TestRole']);
        });

    });

})();