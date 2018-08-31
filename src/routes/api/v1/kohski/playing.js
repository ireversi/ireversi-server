const router = require('express').Router();
const PlayingModel = require("../../../../models/kohski/PlayingModel.js")


router.route('/')
  // .get((req,res) => {
  //   name = req.query.name
  //   email = req.query.email
  //   password = req.query.password

  //   res.json({
  //     'name':String,
  //     'email':String,
  //     'password':String
  //   });
  // })
  .post(async(req, res) => {
    const result ={
      x:+req.body.x,  //+は数値で返すって意味
      y:+req.body.y,
      userID:+req.body.userID
    }

    const Playing = new PlayingModel(result);

    await Playing.save();
    res.json([result]);
  });

module.exports = router;