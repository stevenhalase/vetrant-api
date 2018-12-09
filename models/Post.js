const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: String,
  image: { type: Schema.Types.ObjectId, ref: 'Image' },
  giphyUrl: String,
  content: String,
  date: Number,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel' }
});

PostSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post'
})

PostSchema.virtual('dislikes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post'
})

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
})

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

const autoPopulate = function(next) {
  this.populate({ path: "user", model: "User" });
  this.populate({ path: "image", model: "Image" });
  this.populate({ path: "comments", model: "Comment" });
  this.populate({ path: "likes", model: "Like" });
  this.populate({ path: "dislikes", model: "Dislike" });
  next();
};

PostSchema
  .pre('findOne', autoPopulate)
  .pre('find', autoPopulate);

module.exports = mongoose.model('Post', PostSchema);