const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  name: String,
  image: { type: Schema.Types.ObjectId, ref: 'Avatar' }
});

const autoPopulate = function(next) {
  this.populate({ path: "image", model: "Avatar" });
  next();
};

UserSchema
  .pre('findOne', autoPopulate)
  .pre('find', autoPopulate);

module.exports = mongoose.model('User', UserSchema);