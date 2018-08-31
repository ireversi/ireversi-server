const router = require('express').Router();

router.use('/users', require('./users.js'));
router.use('/kai/playing', require('./kai/playing.js'));

module.exports = router;
