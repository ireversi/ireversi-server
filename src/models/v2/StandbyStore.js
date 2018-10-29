const jwt = require('jsonwebtoken');
const config = require('../../config.js');
// remainingに設定する待ち時間
const { waitTime } = config;

module.exports = {
  getWaitTime() {
    return waitTime;
  },
  getRemaining(created) {
    const timeLog = Date.now() - created; // テストを投げた時刻とチェックする時刻との時間差
    const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間
    return remaining;
  },
  getPlayInfo(req) {
    const dateNow = Date.now(); // 受け取った時刻
    const { userId } = jwt.decode(req.headers.authorization);
    const play = {
      playNow: dateNow,
      x: +req.body.x,
      y: +req.body.y,
      userId,
    };

    return play;
  },
};
