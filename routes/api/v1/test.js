const router = require('express').Router();

/**
 * @swagger
 * /test:
 *   get:
 *     parameters:
 *       - name: "text"
 *         in: "query"
 *         description: "text test"
 *         required: true
 *         type: "string"
 *     responses:
 *       200:
 *         description: "success"
 *         schema:
 *           type: "object"
 *           properties:
 *             message:
 *               type: "string"
 *               example: "aaa"
 */
router.get('/', (req, res) => {
  res.json({
    message: req.query.text,
  });
});

module.exports = router;
