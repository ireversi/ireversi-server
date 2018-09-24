const router = require('express').Router();
const pieceCtrl = require('../../../../models/v2/PieceModel.js');

router.use('/piece', require('./piece.js'));

router.route('/')
  .get((req, res) => {
    const x = +req.query.x;
    const y = +req.query.y;
    const userId = +req.query.userId;
    pieceCtrl.addPiece({
      x,
      y,
      userId,
    });
    console.log(userId);


    res.json({
      status: 'success',
    });
  })
  .post(async (req, res) => res.sendStatus(204))
  .delete(async (req, res) => res.sendStatus(204));

module.exports = router;
