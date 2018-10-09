const router = require('express').Router();

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.use('/board', require('./board/index.js'));
router.use('/board/specified_size', require('./board/specified_size.js'));
router.use('/piece', require('./piece/index.js'));
router.use('/first_piece', require('./first_piece/index.js'));

// var config = {
//   appRoot:'../../../config.js' // required config
// };

// var jwt_decode = require('jwt-decode');

// config.swaggerSecurityHandlers = {
//   tokenAuth : function (req, authOrSecDef, scopesOrApiKey, cb) {
//     try{
//       var decoded = jwt_decode(scopesOrApiKey);

//       req.requestContext = {
//         authorizer : {
//           claims : decoded
//         }
//       };

//       cb();
//     }catch(error){
//       cb(error);
//     }
//   }
// };

module.exports = router;
