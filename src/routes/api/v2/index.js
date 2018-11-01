const router = require('express').Router();
const jwt = require('jsonwebtoken');

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

router.options('*', (req, res) => {
  res.sendStatus(200);
});

// userIdの取得はいつでもできるようにする。
router.use('/user_id_generate', require('./userIdGenerate/index.js'));

// authorizationに対応するコード
const config = {
  appRoot: __dirname, // required config
};
config.swaggerSecurityHandlers = {
  tokenAuth(req, authOrSecDef, scopesOrApiKey) {
    try {
      const decoded = jwt.decode(scopesOrApiKey);
      req.requestContext = {
        authorizer: {
          userId: decoded,
        },
      };
      // cb();
    } catch (error) {
      // cb(error);
    }
  },
};

router.use((req, res, next) => {
  try {
    const headerValue = req.headers.authorization;
    const accessToken = jwt.decode(headerValue);
    const isUserId = (Object.keys(accessToken).indexOf('userId') !== -1);
    if (isUserId) {
      next();
    } else {
      res.status(401).end();
    }
  } catch (e) {
    res.status(401).end();
  }
});
router.use('/board', require('./board/index.js'));
router.use('/board/specified_size', require('./board/specified_size.js'));
router.use('/piece', require('./piece/index.js'));
router.use('/first_piece', require('./first_piece/index.js'));
router.use('/topScore', require('./topScore/index.js'));

module.exports = router;
