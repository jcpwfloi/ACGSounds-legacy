var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var sheetSchema = new Schema({
    sheetName: String,
    sheetIntro: String,
    sheetTag: [String],
    approved: Boolean,
    comments: [ { type: Schema.Types.ObjectId, ref: 'Comment' } ]
});

sheetSchema.plugin(lastUpdate);

module.exports = mongoose.model('Sheet', sheetSchema);
