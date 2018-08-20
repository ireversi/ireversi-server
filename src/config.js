const dotenv = require('dotenv');

switch (process.env.NODE_ENV) {
  case 'production':
    dotenv.config({
      path: 'production.env',
    });
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
  mongoHost: process.env.MONGO_HOST || 'localhost:27017',
  mongoUsername: process.env.MONGO_USERNAME || 'root',
  mongoPassword: process.env.MONGO_PASSWORD || 'root',
  mongoDBname: process.env.MONGO_DBNAME || 'ireversi-dev',
};
