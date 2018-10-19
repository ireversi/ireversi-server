const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
const BoardStore = require('../../../../models/v2/BoardStore.js');
const StandbyStore = require('../../../../models/v2/StandbyStore.js');

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    const { x, y, userId } = StandbyStore.getPlayInfo(req); // 送られてきた置きコマ
    const pieceResult = { x, y, userId };

    // 下記は仮
    // 以下、指定されたdirectionを基にして、めくる・置く動作が必要。
    PieceStore.addPiece(pieceResult); // コマを置く
    const board = BoardStore.getBoard();
    // const pieces = PieceStore.getPieces();

    await res.json(board);
  })
  .delete((req, res) => {
    PieceStore.deletePieces();
    res.sendStatus(204);
  });
module.exports = router;
