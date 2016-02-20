var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var minlength = [4, 'The value of `{PATH}` (`{VALUE}`) does not match the minimum allowed length ({MINLENGTH}).']
var maxlength = [12, 'The value of `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']

var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: minlength,
        maxlength: maxlength
    },
    password: {
        type: String,
        required: true,
        minlength: 32,
        maxlength: 32
    }
});

