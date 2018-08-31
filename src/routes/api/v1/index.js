const router = require('express').Router();

router.use('/users', require('./users.js'));
router.use('/matsui/playing', require('./matsui/playing.js'));

module.exports = router;
