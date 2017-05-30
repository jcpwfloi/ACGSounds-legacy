var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    sheet: { type: Schema.Types.ObjectId, ref: 'Sheet' },
    text: String,
    likeCount: Number
});

commentSchema.plugin(lastUpdate);

module.exports = mongoose.model('Comment', commentSchema);
