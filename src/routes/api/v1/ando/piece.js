const router = require('express').Router();

const PieceModel = require('../../../../models/ando/PieceModel.js');

const propFilter = '-_id -__v';

router.route('/')
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    if ((await PieceModel.find({ x: result.x, y: result.y })).length === 0) {
      const Piece = new PieceModel(result);
      await Piece.save();
    }

    const allPieces = await PieceModel.find({}, propFilter);

    res.json(allPieces);
  });

module.exports = router;
