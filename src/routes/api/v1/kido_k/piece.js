const router = require('express').Router();

const PieceModel = require('../../../../models/kido_k/PieceModel.js');

router.route('/')
  .get(async (req, res) => {
    res.json(await PieceModel.findOne({ user_id: req.query.user_id }));
  })
  .post(async (req, res) => {
    const result = {
      x: req.body.x,
      y: req.body.y,
      user_id: req.body.user_id,
    }
    const Piece = new PieceModel(result);
    await Piece.save();
    // res.json({ result });
    res.json({ status: 'success' });
  });

module.exports = router;
