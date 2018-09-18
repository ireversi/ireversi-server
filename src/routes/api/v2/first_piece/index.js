const router = require('express').Router();

router.use('/direction', require('./direction.js'));
router.use('/position', require('./position.js'));

module.exports = router;
