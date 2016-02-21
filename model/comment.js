var mongoose = require('mongoose');
var lastUpdate = require('./plugins/lastUpdate');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    belongTo: { type: Schema.Types.ObjectId, ref: 'Sheet' }
});

commentSchema.plugin(lastUpdate);

module.exports = mongoose.model('Comment', commentSchema);
