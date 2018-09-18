const router = require('express').Router();

router.use('/board/index', require('./board/index.js'));
router.use('/board/specified_range', require('./board/specified_range.js'));
router.use('/piece/index', require('./piece/index.js'));
router.use('/first_piece/direction', require('./first_piece/direction.js'));
router.use('/first_piece/position', require('./first_piece/position.js'));

module.exports = router;
