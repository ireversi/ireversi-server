const router = require('express').Router();

router.use('/fujii/playing', require('./fujii/playing.js'));
router.use('/matsuda/playing', require('./matsuda/playing.js'));
router.use('/hi85/playing', require('./hi85/playing.js'));
router.use('/momii/playing', require('./momii/playing.js'));
router.use('/ando/piece', require('./ando/piece.js'));
router.use('/ando/board', require('./ando/board.js'));
router.use('/kido/piece', require('./kido/piece.js'));
router.use('/kido/board', require('./kido/board.js'));
router.use('/kai/playing', require('./kai/playing.js'));
router.use('/kai/board', require('./kai/board.js'));
router.use('/kai/delete', require('./kai/delete.js'));
router.use('/kohski/playing', require('./kohski/playing.js'));
router.use('/fujii/board', require('./fujii/board.js'));
router.use('/kohski/board', require('./kohski/board.js'));

module.exports = router;
