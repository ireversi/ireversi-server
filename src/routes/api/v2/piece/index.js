const router = require('express').Router();
const boardCtrl = require('../../../../models/v2/boardController.js');

router.use('/flip', require('./flip.js'));

router.route('/')
  .get((req, res) => {
    const x = +req.query.x;
    const y = +req.query.y;
    const userId = +req.query.userId;
    boardCtrl.addPiece({
      x,
      y,
      userId,
    });

    res.json({
      status: 'success',
    });
  })
  .post(async (req, res) => res.sendStatus(204))
  .delete(async (req, res) => res.sendStatus(204));

module.exports = router;
