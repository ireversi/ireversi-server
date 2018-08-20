const router = require('express').Router();

const UserModel = require('../../../models/UserModel.js');

/**
 * @swagger
 * tags:
 *   - name: users
 *     description: Users API
 *
 * /users:
 *   get:
 *     tags:
 *       - users
 *     parameters:
 *       - name: "name"
 *         in: "query"
 *         description: "user info"
 *         required: true
 *         type: "string"
 *     responses:
 *       200:
 *         description: "success"
 *         schema:
 *           type: "object"
 *           properties:
 *             user_id:
 *               type: "string"
 *               example: "aaaaaaaa"
 *             name:
 *               type: "string"
 *               example: "aaaaaaaa"
 *             email:
 *               type: "string"
 *               example: "aaa@aaa.aaa"
 *             password:
 *               type: "string"
 *               example: "aaaaaaaa"
 *             created:
 *               type: "string"
 *               example: "YYYY-MM-DD HH:mm:ss"
 *   post:
 *     tags:
 *       - users
 *     parameters:
 *       - name: "name"
 *         in: "formData"
 *         description: "user name"
 *         required: true
 *         type: "string"
 *       - name: "email"
 *         in: "formData"
 *         description: "email"
 *         required: true
 *         type: "string"
 *       - name: "password"
 *         in: "formData"
 *         description: "password"
 *         required: true
 *         type: "string"
 *         format: "password"
 *     responses:
 *       200:
 *         description: "success"
 *         schema:
 *           type: "object"
 *           properties:
 *             status:
 *               type: "string"
 *               example: "success"
 */

router.route('/')
  .get(async (req, res) => {
    res.json(await UserModel.findOne({ name: req.query.name }));
  })
  .post(async (req, res) => {
    const User = new UserModel();
    User.setInitParams();
    User.name = req.body.name;
    User.email = req.body.email;
    User.password = req.body.password;
    await User.save();
    res.json({ status: 'success' });
  });

module.exports = router;
