var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var commentUpvoteSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' }
});

commentUpvoteSchema.plugin(lastUpdate);

module.exports = mongoose.model('CommentUpvote', commentUpvoteSchema);
