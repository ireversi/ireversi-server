/**
 * From https://jestjs.io/docs/en/getting-started
 * @param {number} a
 * @param {number} b
 * @return {number} total
 */
function sum(a, b) {
  return a + b;
}

/**
 * Try Jest
 * Simple using
 */
const calc = {
  sum(a, b) {
    return a + b;
  },
  difference(a, b) {
    return a - b;
  },
  product(a, b) {
    return a * b;
  },
  quotient(a, b) {
    return a / b;
  },
  exponent(a, b) {
    return a % b;
  },
};

/**
 * Try mongoose
 */
const moment = require('moment'); // 日時操作の定番パッケージ
const mongoose = require('mongoose');

const { Schema } = mongoose;
const createUUID = require('../../utils/createUUID.js');

const PracticeSchema = new Schema({
  user_id: String,
  name: String,
  condition: Boolean,
  created: String,
});

// eslint-disable-next-line func-names
PracticeSchema.methods.setInitParams = function () {
  // 8 桁のユニークなキーを作成
  this.user_id = createUUID(8);
  // 実行時の日時を引数の書式で取得
  this.created = moment().format('YYYY-MM-DD HH:mm:ss');
};

module.exports = {
  sum,
  calc,
  // スキーマから第1引数の文字列を名前としたモデルをコンパイル
  PracticeModel: mongoose.model('Practice', PracticeSchema),
};
