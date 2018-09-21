const router = require('express').Router();
<<<<<<< HEAD
const boardCtrl = require('../../../../models/v2/boardControler');

=======
const boardCtrl = require('../../../../models/v2/boardController.js');
>>>>>>> 355130d02cb7ccb4883521e5d4e8443d70902c88

router.use('/specified_range', require('./specified_range.js'));

router.route('/').get(async (req, res) => {
  res.json(boardCtrl.getBoard());
});

module.exports = router;
