var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt');

var Folder = require('./Folder.js');

var UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// From https://medium.com/of-all-things-tech-progress/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359
UserSchema.pre('save', function(next) {         // Note: Useless without https
    bcrypt.hash(this.password, 10, function(err, hash) {
        if(err) return next(err);
        this.password = hash;
        return next();
    });
});

UserSchema.post('save', function(user) {
    Folder.create({
        name: "Default Folder",
        userId: user._id,
        notes: []
    }, function(err, folder) {
        return err;
    });
});

// From https://medium.com/of-all-things-tech-progress/starting-with-authentication-a-tutorial-with-node-js-and-mongodb-25d524ca0359
UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err) return callback(err);
            if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    var err = new Error('Wrong username.');
                    return callback(err);
                }
            });
        });
}

UserSchema.statics.fromId = function(id, callback) {
    User.findOne({ _id: id })
        .exec(function(err, user) {
            if (err) return callback(err);
            if (!user) {
                var err = new Error('User not found.')
                err.status = 401;
                return callback(err);
            }
            return callback(null, user);
        });
}

var User = mongoose.model('User', UserSchema);
module.exports = User;
