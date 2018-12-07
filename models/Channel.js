const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Channel', ChannelSchema);