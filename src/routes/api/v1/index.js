// const router = require('express').Router();

// router.use('/users', require('./users.js'));

// module.exports = router;


const router = require('express').Router(); //ルーターの役割

router.use('/users', require('./users.js'));
router.use('/homework/playing', require('./homework/playing.js'));

module.exports = router;