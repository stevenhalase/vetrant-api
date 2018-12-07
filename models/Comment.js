const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CommentSchema = new Schema({
	date : Number,
  content : String,
  image: String,
	user : { type: Schema.Types.ObjectId, ref: 'User' },
	post : { type: Schema.Types.ObjectId, ref: 'Post' },
});

CommentSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'comment'
})

CommentSchema.virtual('dislikes', {
  ref: 'Dislike',
  localField: '_id',
  foreignField: 'comment'
})

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);