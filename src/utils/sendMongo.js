const storePlayHistory = require('./storePlayHistory');
const BoardHistoryModel = require('../models/v2/BoardHistoryModel.js');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
// const propFilter = '-_id -__v';

let enabled = false;

module.exports = {
  async startSendingMongo() {
    enabled = true;
    while (enabled) {
      const standbySendMongo = await storePlayHistory.getStandbySendMongo();
      if (standbySendMongo.length === 0) {
        // console.log('1000ミリ秒ずつまわってます');
        await sleep(1000);
      } else {
        // console.log('配列にコマが見つかりました。Mongoに送信しますね。');
        for (let i = 0; i < standbySendMongo.length; i += 1) {
          const sendMongoModel = new BoardHistoryModel(standbySendMongo[i]);
          new BoardHistoryModel(sendMongoModel).save();
        }
        storePlayHistory.deleteStandbySendMongo();
      }
      // const data = JSON.parse(JSON.stringify(await BoardHistoryModel.find({}, propFilter)));
      // console.log(positionData);
    }
  },
  stopSendingMongo() {
    enabled = false;
  },
};
