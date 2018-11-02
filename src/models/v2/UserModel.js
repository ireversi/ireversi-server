const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  created: Date,
  modified: Date,
  user_id: Number,
});

module.exports = mongoose.model('UserModel', UserSchema);
