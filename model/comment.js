var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    likeCount: Number
});

commentSchema.plugin(lastUpdate);

module.exports = mongoose.model('Comment', commentSchema);
