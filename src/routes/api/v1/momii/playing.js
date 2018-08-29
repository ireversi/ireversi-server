const router = require('express').Router();

router.route('/')
  .post((req, res) => {
    res.json({
      x: 0,
      y: 0,
      userId: 1,
    });
  });

module.exports = router;
