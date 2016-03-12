var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var sheetSchema = new Schema({
    sheetName: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 40
    },
    sheetIntro: {
        type: String,
        minlength: 3,
        maxlength: 500
    },
    sheetTag: [ { type: String, minlength: 1, maxlength: 10 } ],
    approved: Number,
    comments: [ { type: Schema.Types.ObjectId, ref: 'Comment' } ],
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

sheetSchema.plugin(lastUpdate);

module.exports = mongoose.model('Sheet', sheetSchema);
