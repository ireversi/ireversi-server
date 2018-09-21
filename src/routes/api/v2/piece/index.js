const router = require('express').Router();
const boardCtrl = require('../../../../models/v2/boardControler');

router.route('/')
  .get((req, res)=>{
    const x = +req.query.x;
    const y = +req.query.y;
    const user_id = +req.query.user_id;
    boardCtrl.addPiece({
      x,
      y,
      user_id,
    });

    res.json({
      status: 'success',
    });
  })
  .post(async (req, res) => res.sendStatus(204))
  .delete(async (req, res) => res.sendStatus(204));

module.exports = router;
