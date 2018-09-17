const router = require('express').Router();

router.post('/', (req, res) => res.sendStatus(204))
  .delete('/', (req, res) => res.sendStatus(204));

module.exports = router;
