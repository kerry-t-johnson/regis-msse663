const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const logger = require('../../config/winston');
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    first_name: {type: String},
    last_name: {type: String},
    passHash: {type: String, required: true}
});

UserSchema.plugin(uniqueValidator);

UserSchema.methods.validatePassword = function(password) {
    if(!bcrypt.compareSync(password, this.passHash)) {
        throw new Error('Invalid username or password');
    }
};

UserSchema.statics.clearAll = () => {
    return new Promise(async (resolve, reject) => {
        User.deleteMany({}, (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

UserSchema.statics.createUser = function(email, password, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = new User({email: email, first_name: options.first_name, last_name: options.last_name});
            user.password = password; // encrypts password

            await user.save();
            resolve(user);
        }
        catch(error) {
            reject(error);
        }
    });
};

UserSchema.statics.findByDbId = function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findById(id);
            resolve(user);
        }
        catch(error) {
            reject(error);
        }
    });
};

UserSchema.statics.findByUsername = function(username) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({email: username});
            resolve(user);
        }
        catch(error) {
            reject(error);
        }
    });
};

UserSchema.virtual("password").set(function(value) {
    this.passHash = bcrypt.hashSync(value, 12);
});

mongoose.set('useCreateIndex', true);
const User = mongoose.model('User', UserSchema);
module.exports = User;
