const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');


router.route('/')
  .post((req, res) => {
    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };
    const status = PieceStore.judgePiece(piece.x, piece.y, piece.userId);
    res.json({ status, piece });
  })
  .delete((req, res) => {
    const pieces = PieceStore.deletePieces();
    res.json(pieces);
  });
module.exports = router;
