const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlayingSchema = new Schema({
  x: Number,
  y: Number,
  userId: Number,
  // created: Number,
});


module.exports = mongoose.model('FujiiPlaying', PlayingSchema);
