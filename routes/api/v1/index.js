const router = require('express').Router();

router.use('/test', require('./test.js'));
router.use('/users', require('./users.js'));

module.exports = router;
