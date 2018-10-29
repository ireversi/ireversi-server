const BoardHistoryModel = require('../models/v2/BoardHistoryModel.js');

module.exports = {
  addMongo(x, y, userId) {
    const playHistory = new BoardHistoryModel({
      method: 'post',
      path: 'piece',
      piece: {
        x,
        y,
        userId,
      },
      date: Date.now(),
    });

    new BoardHistoryModel(playHistory).save();
  },
};
