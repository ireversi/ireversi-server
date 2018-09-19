const mongoose = require('mongoose');

const { Schema } = mongoose;

const BoardHistorySchema = new Schema({
  order: Number, // コマを置いた手の順番, ミリ秒で同じタイミングの手を分ける
  method: String,
  path: String,
  date: {
    type: Date,
    default: Date.now,
  },
  parameters: Schema.Types.Mixed, // any型っぽいやつ, deleteやpieceなど様々な型に対応
});

module.exports = mongoose.model('BoardHistory', BoardHistorySchema);
