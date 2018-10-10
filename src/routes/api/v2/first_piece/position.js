const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
const calcScore = require('../board/calcScore.js');

const dirXY = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    const dateNow = Date.now(); // 受け取った時刻
    const board = PieceStore.getBoard(); // board全体
    const pcs = board.pieces; // 盤面のコマ。デフォルトのx:0, y:0, userId:1がいる
    const stb = board.standbys; // スタンバイ中のマス
    let status; // 置けたかどうか
    const play = {
      playNow: dateNow,
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };
    const score = calcScore.calc(play.userId, pcs); // 置いてある自コマの数

    // 自コマがスタンバイを置ける状態かを調べる
    if (score > 0) { // 自コマが他マスにあればfalse
      status = false;
    } else if (stb.find(s => s.piece.x === play.x && s.piece.y === play.y)) {
      // 置こうとするマスに他コマがスタンバイであればfalse
      status = false;
    } else if (pcs.find(pc => pc.x === play.x && pc.y === play.y)) {
      // 置こうとするマスに他コマがあればfalse
      status = false;
    } else {
      // 自コマが盤面にない、置きたいマスにコマやスタンバイがない場合、
      // そのマスの四方に何かしらコマがあれば置ける
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = play.x + dirX;
        const aroundY = play.y + dirY;
        if (pcs.find(pc => pc.x === aroundX && pc.y === aroundY)) {
          status = true;
          break;
        } else {
          status = false;
        }
      }
    }

    const playResult = { // boardに格納する形式
      remaining: dateNow, // サーバーに届いた時刻
      piece: {
        x: play.x,
        y: play.y,
        userId: play.userId,
      },
    };

    const playReturn = { // positionとして返す値
      status,
      standby: { ...playResult },
    };

    if (status === true) {
      PieceStore.addStandby(playResult); // boardに追加
      await res.send(playReturn); // 1プレイの結果を返す
    } else {
      await res.send(playReturn); // 1プレイの結果を返す
    }
  });
module.exports = router;
