const router = require('express').Router();
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../models/v2/PieceStore.js');

router.route('/')
  .post((req, res) => {
    const jwtId = req.headers.authorization;
    const { userId } = jwt.decode(jwtId);
    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId,
    };

    const status = PieceStore.judgePiece(piece.x, piece.y, piece.userId);
    res.json({ status, piece });
  })
  .delete((req, res) => {
    const pieces = PieceStore.deletePieces();
    res.json(pieces);
  });
module.exports = router;
