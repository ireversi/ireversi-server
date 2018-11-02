const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
const StandbyStore = require('../../../../models/v2/StandbyStore.js');
const storeHistory = require('../../../../utils/storePlayHistory.js');

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
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

router.route('/')
  .post(async (req, res) => {
    const created = Date.now(); // 受け取った時刻
    const pcs = PieceStore.getPieces(); // 盤面のコマ。テスト時はデフォルトのx:0, y:0, userId:1がいる
    const stb = PieceStore.getStandbys(); // スタンバイ中のマス
    const { x, y, userId } = StandbyStore.getPlayInfo(req); // 送られてきた置きコマ
    const score = calcScore.calc(userId, pcs); // 置いてある自コマの数
    let status; // 置けたかどうか

    // 自コマがスタンバイを置ける状態かを調べる
    if (score > 0) { // 自コマが他マスにあればfalse
      status = false;
    } else if (stb.find(s => s.piece.x === x && s.piece.y === y)) {
      // 置こうとするマスに他コマがスタンバイであればfalse
      status = false;
    } else if (pcs.find(pc => pc.x === x && pc.y === y)) {
      // 置こうとするマスに他コマがあればfalse
      status = false;
    } else {
      // 自コマが盤面にない、置きたいマスにコマやスタンバイがない場合、
      // そのマスの四方に何かしらコマがあれば置ける
      for (let i = 0; i < dirXY.length; i += 1) {
        const dirX = dirXY[i][0];
        const dirY = dirXY[i][1];
        const aroundX = x + dirX;
        const aroundY = y + dirY;
        if (pcs.find(pc => pc.x === aroundX && pc.y === aroundY)) {
          status = true;
          break;
        } else {
          status = false;
        }
      }
    }

    const remaining = status ? StandbyStore.getRemaining(created) : 0;
    const piece = { x, y, userId };
    const playResult = { // piecesに格納する値
      created,
      remaining,
      piece,
    };
    const playReturn = { // positionとして返す値
      status,
      standby: {
        remaining,
        piece,
      },
    };

    if (status) {
      PieceStore.addStandby(playResult); // boardに追加
      storeHistory.addPositionMongo(x, y, userId, created);
    }
    await res.send(playReturn); // 1プレイの結果を返す
  });
module.exports = router;
