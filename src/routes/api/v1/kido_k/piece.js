const router = require('express').Router();
const propfilter = '-_id -__v';
const PieceModel = require('../../../../models/kido_k/PieceModel.js');

router.route('/')
  .get(async (req, res) => {
    res.json(await PieceModel.findOne({ userid: req.query.userid }));
  })
  .post(async (req, res) => {
    const pieces = await PieceModel.find({}, propfilter);
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userid: +req.body.userid,
    };

    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    };

    const Piece = new PieceModel(result);
    await Piece.save();
    res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;
