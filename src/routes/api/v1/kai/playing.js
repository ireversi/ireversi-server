const router = require('express').Router();

const PlayingModel = require('../../../../models/kai/PlayingModel.js');


// route('/') はルーティングがここまでですよの書き方
// データベースの処理は基本非同期なので、同期させる
router.route('/')
    .get(async(req, res) => {
        const pass = await PlayingModel.findOne({ userId: req.query.userId });
        res.json(pass);
    })
    // res.jsonでresponse.bodyに返す
    .post(async(req, res) => {
        const Playing = new PlayingModel({
            x: 0,
            y: 0,
            userId: 1
        });
        await Playing.save();
        res.json({ status: 'success' });
    });

module.exports = router;
