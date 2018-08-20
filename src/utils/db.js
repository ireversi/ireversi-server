const mongoose = require('mongoose');

const {
  nodeEnv,
  mongoHost,
  mongoUsername,
  mongoPassword,
  mongoDBname,
} = require('../config.js');

const connect = async () => {
  await mongoose.connect(`mongodb://${mongoHost}`, {
    user: mongoUsername,
    pass: mongoPassword,
    dbName: mongoDBname,
  });

  mongoose.connection.on('error', (err) => {
    throw new Error(`MongoDB connection error: ${err}`);
  });
};

let isDBPrepared = false;

module.exports = {
  async connectDB() {
    if (nodeEnv === 'test') throw new Error('You cannot connect db on test mode');
    await connect();
  },
  async prepareDB() {
    if (nodeEnv !== 'test') throw new Error('You can drop db on test mode only');

    if (!isDBPrepared) {
      isDBPrepared = true;
      await connect();
    }
  },
  async deleteAllDataFromDB() {
    if (nodeEnv !== 'test') throw new Error('You can drop db on test mode only');

    await mongoose.connection.dropDatabase();
  },
};
