const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const CommentSchema = new Schema({
	date : Number,
  content : String,
  image: { type: Schema.Types.ObjectId, ref: 'Image' },
  giphyUrl: String,
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

const autoPopulate = function(next) {
  this.populate({ path: "user", model: "User" });
  this.populate({ path: "image", model: "Image" });
  this.populate({ path: "likes", model: "Like" });
  this.populate({ path: "dislikes", model: "Dislike" });
  next();
};

CommentSchema
  .pre('findOne', autoPopulate)
  .pre('find', autoPopulate);

module.exports = mongoose.model('Comment', CommentSchema);