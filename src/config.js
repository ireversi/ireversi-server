const dotenv = require('dotenv');

switch (process.env.NODE_ENV) {
  case 'production':
    break;
  case 'test':
    dotenv.config({
      path: 'test.env',
    });
    break;
  default:
    dotenv.config();
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 10000,
  origin: process.env.URL_ORIGIN || 'http://localhost:10000',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/ireversi',
};
