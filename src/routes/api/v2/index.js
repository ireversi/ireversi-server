const router = require('express').Router();

router.use('/board', require('./board/index.js'));
router.use('/board/specified_size', require('./board/specified_size.js'));
router.use('/piece', require('./piece/index.js'));
router.use('/first_piece', require('./first_piece/index.js'));

module.exports = router;
