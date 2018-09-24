const mongoose = require('mongoose');

const { Schema } = mongoose;

const BoardStateSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  history_order: Number, // BoardHistoryModelの何番目時点でのデータか
  board: [
    {
      pieces: [
        {
          x: Number,
          y: Number,
          user_id: Number,
        },
      ],
      standbys: [
        {
          remaining: Number,
          piece: {
            x: Number,
            y: Number,
            user_id: Number,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('BoardState', BoardStateSchema);
