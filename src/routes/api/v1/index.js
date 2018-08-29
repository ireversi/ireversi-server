const router = require('express').Router();

router.use('/users', require('./users.js'));
router.use('/momii/playing', require('./momii/playing.js'));

module.exports = router;
