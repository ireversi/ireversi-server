const router = require('express').Router();

router.use('/users', require('./users.js'));
router.use('/matsuda/playing', require('./matsuda/playing.js'));

module.exports = router;
