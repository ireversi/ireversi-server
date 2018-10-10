const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
const StandbyStore = require('../../../../models/v2/StandbyStore.js');

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
    const pcs = PieceStore.getPieces(); // 盤面のコマ。テスト時はデフォルトのx:0, y:0, userId:1がいる
    const stb = PieceStore.getStandbys(); // スタンバイ中のマス
    const play = StandbyStore.getPlayInfo(req); // 送られてきた置きコマ
    const score = calcScore.calc(play.userId, pcs); // 置いてある自コマの数
    let status; // 置けたかどうか

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

    const piece = {
      x: play.x,
      y: play.y,
      userId: play.userId,
    };

    const playResult = { // boardに格納する形式
      created: dateNow, // サーバーに届いた時刻
      piece,
    };

    const playReturn = { // positionとして返す値
      status,
      standby: {
        remaining: StandbyStore.getRemaining(dateNow),
        piece,
      },
    };
    console.log(playReturn);


    if (status === true) {
      PieceStore.addStandby(playResult); // boardに追加
      await res.send(playReturn); // 1プレイの結果を返す
    } else {
      await res.send(playReturn); // 1プレイの結果を返す
    }
  });
module.exports = router;
