const router = require('express').Router();

router.use('/users', require('./users.js'));

module.exports = router;
