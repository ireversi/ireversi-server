// const moment = require('moment');
const mongoose = require('mongoose');

const { Schema } = mongoose;
// const createUUID = require('../../utils/createUUID.js');

const PlayingSchema = new Schema({
  x: Number,
  y: Number,
  userId: Number,
  // created: Number,
});

module.exports = mongoose.model('KaiPlaying', PlayingSchema);
