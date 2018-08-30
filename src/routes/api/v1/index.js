const router = require('express').Router();

router.use('/users', require('./users.js'));
// router.use('/playing', require('./playing.js'));

module.exports = router;