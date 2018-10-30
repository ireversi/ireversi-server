const mongoose = require('mongoose');

const { Schema } = mongoose;

const BoardHistorySchema = new Schema({
  // order: Number, // コマを置いた手の順番, ミリ秒で同じタイミングの手を分ける
  method: String,
  path: String,
  piece: {
    x: Number,
    y: Number,
    userId: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  position: {
    x: Number,
    y: Number,
    userId: String,
  },
  direction: {
    x: Number,
    y: Number,
    userId: String,
  },
  // any型っぽいやつ, deleteやpieceなど様々な型に対応
  // parameters: Schema.Types.Mixed
});

module.exports = mongoose.model('BoardHistory', BoardHistorySchema);
