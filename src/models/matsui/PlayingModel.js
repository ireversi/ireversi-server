
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlaySchema = new Schema({
  x: Number,
  y: Number,
  userId: Number,
});

module.exports = mongoose.model('MatsuiPlaying', PlaySchema);
