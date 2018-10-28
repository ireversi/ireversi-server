const router = require('express').Router();
const PieceStore = require('../../../../models/v2/PieceStore.js');
// const BoardHistoryModel = require('../../../../models/v2/BoardHistoryModel.js');

// const propFilter = '-_id -__v';

router.route('/')
  .post(async (req, res) => {
    // const pieceDB = JSON.parse(JSON.stringify(await BoardHistoryModel.find({}, propFilter)));
    // console.log(pieceDB);

    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.query.userId,
    };
    const status = PieceStore.judgePiece(piece.x, piece.y, piece.userId);
    // const playHistory = new BoardHistoryModel({
    //   method: 'post',
    //   path: 'piece',
    //   piece,
    //   date: Date.now(),
    //   position: {},
    //   direction: {},
    // });
    // console.log(playHistory);

    // if (status) {
    //   new BoardHistoryModel(playHistory).save();
    // }
    res.json({ status, piece });
  })
  .delete((req, res) => {
    const pieces = PieceStore.deletePieces();
    res.json(pieces);
  });
module.exports = router;
