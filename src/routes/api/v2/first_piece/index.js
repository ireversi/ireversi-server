const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');

router.use('/direction', require('./direction.js'));
router.use('/position', require('./position.js'));

router.route('/').delete((req, res) => {
  PieceStore.deletePieces();
  PieceStore.deleteStandbys();
  const pieces = PieceStore.initPieces(); // piecesを初期値にする
  res.json(pieces);
});

module.exports = router;
