var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 12
    },
    password: {
        type: String,
        required: true,
        minlength: 32,
        maxlength: 32
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 40
    },
    intro: {
        type: String,
        minlength: 5,
        maxlength: 50
    },
    mobile: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /(\d{11})|(\d{3}-\d{4}-\d{4})/.test(v);
            },
            message: '{VALUE} is not a valid mobile number'
        }
    },
    audit: Boolean,
    admin: Boolean
});

module.exports = mongoose.model('User', userSchema);

