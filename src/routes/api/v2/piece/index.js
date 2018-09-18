const router = require('express').Router();

router.route('/')
  .post(async (req, res) => res.sendStatus(204))
  .delete(async (req, res) => res.sendStatus(204));

module.exports = router;
