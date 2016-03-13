var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var sheetSchema = new Schema({
    sheetName: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 60
    },
    sheetIntro: {
        type: String,
        minlength: 3,
        maxlength: 500
    },
    sheetTag: [ { type: String, minlength: 1, maxlength: 20 } ],
    approved: Number,
    comments: [ { type: Schema.Types.ObjectId, ref: 'Comment' } ],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    auditor: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
    auditDate: [ Date ]
});

sheetSchema.plugin(lastUpdate);

module.exports = mongoose.model('Sheet', sheetSchema);
