const router = require('express').Router();

router.use('/specified_range', require('./specified_range.js'));

router.route('/').get(async (req, res) => res.sendStatus(204));

module.exports = router;
