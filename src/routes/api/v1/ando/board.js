const router = require('express').Router();

const PieceModel = require('../../../../models/ando/PieceModel.js');

const propFilter = '-_id -__v';

router.route('/')
  .get(async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.json(await PieceModel.find({}, propFilter));
  });

module.exports = router;
