const moment = require('moment');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const createUUID = require('../utils/createUUID.js');

const UserSchema = new Schema({
  user_id: String,
  name: String,
  email: String,
  password: String,
  created: String,
});

// eslint-disable-next-line func-names
UserSchema.methods.setInitParams = function () {
  this.user_id = createUUID(8);
  this.created = moment().format('YYYY-MM-DD HH:mm:ss');
};

module.exports = mongoose.model('User', UserSchema);
