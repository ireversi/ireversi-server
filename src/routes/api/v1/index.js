// const router = require('express').Router();

// router.use('/users', require('./users.js'));

// module.exports = router;


const router = require('express').Router(); // ルーターの役割

router.use('/users', require('./users.js'));

router.use('/homework/playing', require('./homework/playing.js'));
router.use('/matsui/playing', require('./matsui/playing.js'));
router.use('/matsuda/playing', require('./matsuda/playing.js'));
router.use('/hi85/playing', require('./hi85/playing.js'));
router.use('/momii/playing', require('./momii/playing.js'));
router.use('/ando/playing', require('./ando/playing.js'));
router.use('/ando/piece', require('./ando/piece.js'));
router.use('/kido/piece', require('./kido/piece.js'));

router.use('/kai/playing', require('./kai/playing.js'));
router.use('/kai/board', require('./kai/board.js'));

module.exports = router;
