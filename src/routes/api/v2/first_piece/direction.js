const router = require('express').Router();
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../models/v2/PieceStore.js');
const storeHistory = require('../../../../utils/storePlayHistory.js');

const dirList = {
  nw: [-1, 1],
  n: [0, 1],
  ne: [1, 1],
  e: [1, 0],
  se: [1, -1],
  s: [0, -1],
  sw: [-1, -1],
  w: [-1, 0],
};

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

router.route('/')
  .post((req, res) => {
    let status = false;
    // 送られてきたuserIdのある座標を返す
    const standbys = PieceStore.getStandbys(); // スタンバイの配列
    const mapPieces = PieceStore.getPiecesMap(); // piecesのMapオブジェクトを取得
    const { userId } = jwt.decode(req.headers.authorization); // 送られてきたuserId
    const { direction } = req.body; // 送られてきたdirection
    const dir = dirList[direction]; // 送られてきたdirectionから向かう座標を取得
    // userIdのある座標を返す
    const userPosition = standbys.find(standby => standby.piece.userId === userId);
    const { x, y } = userPosition.piece; // userIdがある座標
    const piece = { x, y, userId };

    // 残り時間がなければfalseで返す
    if (standbys.find(standby => standby.remaining <= 0)) {
      res.json({
        status,
        piece,
        direction,
      });
    }

    // directionの方向にコマがある場合
    let n = 1;
    const coordinates = [];
    while (mapPieces.has([x + dir[0] * n, y + dir[1] * n].join())) {
      coordinates.push([x + dir[0] * n, y + dir[1] * n]);
      n += 1;
    }
    if (coordinates.length > 0) {
      coordinates.push([x, y], [x + dir[0] * n, y + dir[1] * n]); // 置いたマスと進んだ先の１コマを追加
      for (let i = 0; i < coordinates.length; i += 1) {
        mapPieces.set([coordinates[i][0], coordinates[i][1]].join(), userId);
      }
      status = true;
      storeHistory.addDirectionMongo(x + dir[0], y + dir[1], userId);
    }
    // standbyを削除
    standbys.splice(standbys.findIndex(standby => standby.piece.userId === userId), 1);
    PieceStore.addSize();
    res.json({
      status,
      piece,
      direction,
    });
  });
module.exports = router;
