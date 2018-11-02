const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BoardHistoryModel = require('../../src/models/v2/BoardHistoryModel.js');

const {
  nodeEnv,
  mongoURI,
} = require('../config.js');

let isDBPrepared = false;

module.exports = {
  async connectDB() {
    if (nodeEnv === 'test') throw new Error('You cannot connect db on test mode');

    const conn = mongoose.connect(mongoURI, { useNewUrlParser: true });
    mongoose.connection.on('error', (err) => {
      throw new Error(`MongoDB connection error: ${err}`);
    });
    await conn;
  },
  async deleteMongo() {
    if (nodeEnv === 'test') throw new Error('You cannot connect db on test mode');

    await BoardHistoryModel.remove();
  },
  async prepareDB() {
    if (nodeEnv !== 'test') throw new Error('You can drop db on test mode only');

    if (!isDBPrepared) {
      isDBPrepared = true; // 一回だけ立てれるように

      const mongod = new MongoMemoryServer(); // メモリー上で起動するサーバー
      const conn = mongoose.connect(await mongod.getConnectionString(), {
        // testのときにMongoDB使うと不安定になるかも
        // ローカルで動くMongoDB作ったほうがいい
        // npm installで設定を済ます方法はないか
        // → require('mongodb-memory-server'); [db.js]
        // jestの公式にも書いてある
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
      });

      mongoose.connection.on('error', (err) => {
        throw new Error(`MongoDB connection error: ${err}`);
      });
      await conn;
    }
  },
  async deleteAllDataFromDB() {
    // testやる度にデータが残っていると、前のテストの結果が影響を残る可能性がある
    // testは並列ではなく、直列でひとつひとつ試す。独立したテストを行うことができる
    if (nodeEnv !== 'test') throw new Error('You can drop db on test mode only');

    await mongoose.connection.dropDatabase();
  },
};
