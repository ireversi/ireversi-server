const mongoose = require('mongoose');

const { Schema } = mongoose;

const PieceSchema = new Schema({
  x: Number,
  y: Number,
  userId: Number,
});

module.exports = mongoose.model('AndoPiece', PieceSchema);
