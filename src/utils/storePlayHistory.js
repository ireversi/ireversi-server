const BoardHistoryModel = require('../models/v2/BoardHistoryModel.js');

const standbySendMongo = [];

module.exports = {
  addPieceMongo(x, y, userId, created) {
    const playHistory = new BoardHistoryModel({
      method: 'post',
      path: 'piece',
      piece: {
        x,
        y,
        userId,
      },
      date: created,
    });
    standbySendMongo.push(playHistory);
    // new BoardHistoryModel(playHistory).save();
  },
  addPositionMongo(x, y, userId, created) {
    const positionHistory = new BoardHistoryModel({
      method: 'post',
      path: 'first_piece/position',
      piece: {
        x,
        y,
        userId,
      },
      date: created,
    });
    standbySendMongo.push(positionHistory);
    // new BoardHistoryModel(positionHistory).save();
  },
  addDirectionMongo(x, y, userId, created) {
    const directionHistory = new BoardHistoryModel({
      method: 'post',
      path: 'first_piece/direction',
      piece: {
        x,
        y,
        userId,
      },
      date: created,
    });
    standbySendMongo.push(directionHistory);
    // new BoardHistoryModel(directionHistory).save();
  },
  getStandbySendMongo() {
    return standbySendMongo;
  },
  deleteStandbySendMongo() {
    standbySendMongo.length = 0;
  },
};
