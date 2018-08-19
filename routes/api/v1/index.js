const router = require('express').Router();

router.use('/test', require('./test.js'));

module.exports = router;
