const router = require('express').Router();
const boardCtrl = require('../../../../models/v2/boardController.js');

router.use('/specified_range', require('./specified_range.js'));

router.route('/').get(async (req, res) => {
  res.json(boardCtrl.getBoard());
});

module.exports = router;
