const router = require('express').Router();

const PieceModel = require('../../../../models/ando/PieceModel.js');

router.route('/')
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    const Piece = new PieceModel(result);
    await Piece.save();
    res.json([result]);
  });

module.exports = router;
