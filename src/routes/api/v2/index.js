const router = require('express').Router();


// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
// accessTokenの確認とルーティング
// router.use((req,res,next)=>{
//   const accessToken = req.headers.body;
//   console.log(accessToken);
// })
router.use('/board', require('./board/index.js'));
router.use('/board/specified_size', require('./board/specified_size.js'));
router.use('/piece', require('./piece/index.js'));
router.use('/first_piece', require('./first_piece/index.js'));
router.use('/userIdGenerate', require('./userIdGenerate/index.js'));
router.use('/accessTest', require('./accessTest/index.js'));

module.exports = router;
