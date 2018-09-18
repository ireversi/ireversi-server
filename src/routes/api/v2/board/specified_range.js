const router = require('express').Router();

router.route('/')
  .get(async (req, res) => res.sendStatus(204));
module.exports = router;
