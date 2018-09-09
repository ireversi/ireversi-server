const router = require('express').Router();

const PlayingModel = require('../../../../models/homework/PlayingModel.js');

const propfilter = '-_id -__v';

router.route('/')
    .post(async (req, res) => {
        const result = {
            x: +req.body.x,
            y: +req.body.y,
            userId: +req.body.userId,
        }

        const Piece = new PlayingModel(result); // 今置いたピースのコピー
        await Piece.save();
        res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを取ってくる
    });

module.exports = router;