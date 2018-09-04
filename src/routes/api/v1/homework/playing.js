const router = require('express').Router();

const PlayingModel = require('../../../../models/homework/PlayingModel.js');

router.route('/')
  .post(async (req, res) => {
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };
    const Piece = new PlayingModel(result);
    await Piece.save();
    res.json([result]);
  });

module.exports = router;
