
const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');


// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post((req, res) => {
    const pieces = PieceStore.getPieces();
    let status;
    const dateNow = Date.now(); // 受け取った時刻

    const piece = {
      pieceNow: dateNow,
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };

    // 置ける状態であればtrueを返す
    if (pieces.find(p => p.standby.piece.x === piece.x && p.standby.piece.y === piece.y)) {
      status = false;
      res.json(PieceStore.getPieces());
    } else {
      status = true;
    }

    const pieceResult = {
      status,
      standby: {
        remaining: dateNow, // サーバーに届いた時刻
        piece: {
          x: piece.x,
          y: piece.y,
          userId: piece.userId,
        },
      },
    };

    PieceStore.addPiece(pieceResult); // コマを置く
    console.log(pieces);

    res.send(pieces);
  })
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });
module.exports = router;
