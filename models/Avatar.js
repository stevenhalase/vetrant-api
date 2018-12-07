const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AvatarSchema = new Schema({
  data: String,
  type: String,
  name: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Avatar', AvatarSchema);