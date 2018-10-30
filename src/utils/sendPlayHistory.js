const BoardHistoryModel = require('../models/v2/BoardHistoryModel.js');

module.exports = {
  addPieceMongo(x, y, userId) {
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
  addPositionMongo(x, y, userId) {
    const positionHistory = new BoardHistoryModel({
      method: 'post',
      path: 'first_piece/position',
      piece: {
        x,
        y,
        userId,
      },
      date: Date.now(),
    });

    new BoardHistoryModel(positionHistory).save();
  },
  addDirectionMongo(x, y, userId) {
    const directionHistory = new BoardHistoryModel({
      method: 'post',
      path: 'first_piece/direction',
      piece: {
        x,
        y,
        userId,
      },
      date: Date.now(),
    });

    new BoardHistoryModel(directionHistory).save();
  },
};
