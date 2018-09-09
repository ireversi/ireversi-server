const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlayingSchema = new Schema({
  x: Number,
  y: Number,
  userid: Number,
});

module.exports = mongoose.model('KidoPlaying', PlayingSchema);
