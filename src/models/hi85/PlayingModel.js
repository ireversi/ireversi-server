const mongoose = require('mongoose');

const { Schema } = mongoose;

const hi85PlayingSchema = new Schema({
  user_id: Number,
  x: Number,
  y: Number,
});

module.exports = mongoose.model('hi85Playing', hi85PlayingSchema);
