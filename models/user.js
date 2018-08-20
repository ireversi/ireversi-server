const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const createUUID = require(`${process.cwd()}/utils/createUUID.js`);

const UserSchema = new Schema({
  user_id: String,
  name: String,
  email: String,
  password: String,
  created: String,
});

UserSchema.methods.setInitParams = function () {
  this.user_id = createUUID(8);
  this.created = moment().format('YYYY-MM-DD HH:mm:ss');
};

module.exports = mongoose.model('User', UserSchema);
