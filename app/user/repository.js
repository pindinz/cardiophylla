(function () {
    'use strict';

    const DEFAULT_PROJECTION = '_id email status name';
    const ENTITY_ACTIONS = require('./authorisation').ENTITY_ACTION_VALUES;

    const mongoose = require('mongoose');
    const sanitize = require('mongo-sanitize');


    module.exports = {
        save: save,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll
    };


    const userSchema = mongoose.Schema({
        email: {type: String, required: true, unique: true},
        passwordHash: {type: Buffer, required: true},
        passwordSalt: {type: Buffer, required: true},
        status: {type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE']},
        name: {type: String},
        roles: {type: [String]}
    });
    userSchema.plugin(require('../authorisation/authorisationSchemaPlugin'), ENTITY_ACTIONS);

    const User = mongoose.model('User', userSchema);

    function save(user) {
        if(user._id){
            return User.update({_id: sanitize(user._id)}, user);
        }
        else{
            let userModel = new User(user);
            return userModel.save();
        }
    }

    function loadById(id, withCredentials) {
        return User.findOne({_id: sanitize(id)}, prepareProjection(withCredentials));
    }

    function loadByEmail(email, withCredentials) {
        return User.findOne({email: sanitize(email)}, prepareProjection(withCredentials));
    }

    function loadAll() {
        return User.find({});
    }

    function prepareProjection(withCredentials){
        let projection = DEFAULT_PROJECTION;
        if(withCredentials){
            projection += ' passwordHash passwordSalt';
        }
        return projection;
    }

})();