const PieceStore = require('./PieceStore.js');

const waitTime = PieceStore.getWaitTime();

module.exports = {
  getRemaining(created) {
    const dateNow = Date.now(); // チェックする時刻
    const timeLog = dateNow - created; // テストを投げた時刻とチェックする時刻との時間差
    const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間
    return remaining;
  },
  getPlayInfo(req) {
    const dateNow = Date.now(); // 受け取った時刻
    const play = {
      playNow: dateNow,
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };
    return play;
  },
};
