const router = require('express').Router();

router.use('/users', require('./users.js'));    //.../usersにマッチしたらrequireする
router.use('/kohski/playing', require('./kohski/playing.js'));  //.../kohski/playingにマッチしたらrequireする

module.exports = router;
