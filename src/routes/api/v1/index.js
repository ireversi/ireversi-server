const router = require('express').Router();

router.use('/users', require('./users.js'));
router.use('/kido_k/piece', require('./kido_k/piece.js'));

module.exports = router;