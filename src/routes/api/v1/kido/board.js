
const router = require('express').Router();

const PieceModel = require('../../../../models/kido/PieceModel.js');

const propfilter = '-_id -__v';


router.route('/')
  .get(async (req, res) => {
    res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;
