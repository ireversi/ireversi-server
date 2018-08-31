const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 10000,
  origin: process.env.URL_ORIGIN || 'http://localhost:10000',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/ireversi',
};
