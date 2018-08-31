const router = require('express').Router();

const UserModel = require('../../../models/UserModel.js');

router.route('/')
  .get(async (req, res) => {
    const pass = await UserModel.findOne({ name: req.query.name });
    // console.log(pass);
    res.json(pass);
  })
  .post(async (req, res) => {
    const User = new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    User.setInitParams();
    await User.save();
    res.json({ status: 'success' });
  });

module.exports = router;
