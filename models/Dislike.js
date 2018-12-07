const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const DislikeSchema = new Schema({
	date : Number,
  content : String,
  image: String,
	user : { type: Schema.Types.ObjectId, ref: 'User' },
	post : { type: Schema.Types.ObjectId, ref: 'Post' },
	comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
});

module.exports = mongoose.model('Dislike', DislikeSchema);