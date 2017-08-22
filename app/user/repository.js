(function () {
    'use strict';

    const DEFAULT_PROJECTION = '_id email status name';

    const mongoose = require('mongoose');

    const userSchema = mongoose.Schema({
        _id: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        passwordHash: {type: Buffer, required: true},
        passwordSalt: {type: Buffer, required: true},
        status: {type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE']},
        name: {type: String}
    });

    const User = mongoose.model('User', userSchema);

    function save(user) {
        var userModel = new User(user);
        return userModel.save();
    }

    function loadById(id, withCredentials) {
        return User.findOne({_id: id}, prepareProjection(withCredentials));
    }

    function loadByEmail(email, withCredentials) {
        return User.findOne({email: email}, prepareProjection(withCredentials));
    }

    function loadAll() {
    }

    function prepareProjection(withCredentials){
        var projection = DEFAULT_PROJECTION;
        if(withCredentials){
            projection += ' passwordHash passwordSalt';
        }
        return projection;
    }

    module.exports = {
        save: save,
        loadById: loadById,
        loadByEmail: loadByEmail,
        loadAll: loadAll
    };

})();