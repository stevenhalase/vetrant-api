const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  name: String,
  image: { type: Schema.Types.ObjectId, ref: 'Avatar' }
});

module.exports = mongoose.model('User', UserSchema);