const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LikeSchema = new Schema({
	date : Number,
	user : { type: Schema.Types.ObjectId, ref: 'User' },
	post : { type: Schema.Types.ObjectId, ref: 'Post' },
	comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
});

module.exports = mongoose.model('Like', LikeSchema);