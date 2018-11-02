const storePlayHistory = require('./storePlayHistory');
const BoardHistoryModel = require('../models/v2/BoardHistoryModel.js');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

let enabled = false;

module.exports = {
  async startSendingMongo() {
    enabled = true;
    while (enabled) {
      const standbySendMongo = await storePlayHistory.getStandbySendMongo();
      if (standbySendMongo.length === 0) {
        await sleep(1000);
      } else {
        for (let i = 0; i < standbySendMongo.length; i += 1) {
          const sendMongoModel = new BoardHistoryModel(standbySendMongo[i]);
          new BoardHistoryModel(sendMongoModel).save();
        }
        storePlayHistory.deleteStandbySendMongo();
      }
    }
  },
  stopSendingMongo() {
    enabled = false;
  },
};
