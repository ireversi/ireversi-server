const router = require('express').Router();

const PlayingModel = require('../../../../models/homework/PlayingModel.js');

const propfilter = '-_id -__v';

function sortData(d){
    d.sort((a, b) => {
        if (a["y"] > b["y"]) return -1;
        if (a["y"] < b["y"]) return 1;
        if (a["y"] === b["y"]){
            if (a["x"] < b["x"]) return -1;
            if (a["x"] > b["x"]) return 1; 
        }
    });
    return d;
}

router.route('/')

    .post(async (req, res) => {
        var data = await PlayingModel.find({}, propfilter);
        const result = {
            x: +req.body.x,
            y: +req.body.y,
            userId: +req.body.userId,
        }

        //めくる処理

        checkTurnOver(result, data);




        const Piece = new PlayingModel(result); // 今置いたピースのコピー
        await Piece.save();
        res.json(await PlayingModel.find({}, propfilter)); // 全体のデータを取ってくる
    });



module.exports = router;

function checkTurnOver (result, data) {
    for (var dx = -1; dx <= 1; dx++) {//x座標の左右範囲
        for(var dy = -1; dy <= 1; dy++) {//y座標の上下範囲
            if (dx == 0 && dy == 0) {//中央（自身）はスキップ
                continue;
            }
            var nx = result["x"] + dx; //確認するx座標
            var ny = result["y"] + dy; //確認するy座標
            
            var target;
            
            for(var i =0;i<data.length;i++){
                if (data[i]["x"] === nx && data[i]["y"] === ny && data[i]["userId"] !== result["userId"]){
                    // target = data;
                    console.log(result, data, dx, dy)
                    // nx += dx;
                    // ny += dy;
                    // checkTurnOver (result, data)
                }
            }

            // // 隣にオセロがない場合
            // if (target && target["userId"]!==result["userId"]){
            //     console.log("continue");
            // } else {
            //     console.log("not-target");
            // }
        }
    }
};
