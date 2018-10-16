const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
const StandbyStore = require('../../../../models/v2/StandbyStore.js');

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post((req, res) => {
    const pieces = PieceStore.getPieces();
    const { x, y, userId } = StandbyStore.getPlayInfo(req); // 送られてきた置きコマ
    const pieceResult = {
      // status,
      standby: {
        piece: { x, y, userId },
      },
    };
    PieceStore.addPiece(pieceResult); // コマを置く
    res.send(pieces);
  })
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });
module.exports = router;
