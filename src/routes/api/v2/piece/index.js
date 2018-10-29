const router = require('express').Router();
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../models/v2/PieceStore.js');
// const BoardHistoryModel = require('../../../../models/v2/BoardHistoryModel.js');

router.route('/')
  .post((req, res) => {
    const jwtId = req.headers.authorization;
    const { userId } = jwt.decode(jwtId);
    const piece = {
      x: +req.body.x,
      y: +req.body.y,
      userId,
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
    // console.log({ status, piece });

    res.json({ status, piece });
  })
  .delete((req, res) => {
    const pieces = PieceStore.deletePieces();
    res.json(pieces);
  });
module.exports = router;
