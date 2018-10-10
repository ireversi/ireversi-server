const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');

router.use('/direction', require('./direction.js'));
router.use('/position', require('./position.js'));

router.route('/').delete((req, res) => {
  PieceStore.deleteStandbys(); // standbyを消す
  const pieces = PieceStore.initPieces(); // piecesを初期値にする
  res.json(pieces);
});

module.exports = router;
