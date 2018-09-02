const router = require('express').Router();
const PieceModel = require('../../../../models/kido_k/PieceModel.js');
const propfilter = '-_id -__v';

router.route('/')
  .post(async (req, res) => {
    const pieces = await PieceModel.find({}, propfilter);
    const result = {
      x: + req.body.x,
      y: + req.body.y,
      userid: + req.body.userid,
    };

    // check puts piece same space 
    // ============================================================
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    };
    const Piece = new PieceModel(result);
    await Piece.save();

    // ============================================================

    // check turn over
    // ============================================================
    //pick up 
    const turnlist = { n: [], ne: [], e: [], se: [], s: [], sw: [], w: [], nw: [] }
    for (var i = 0; i < pieces.length; i++) {
      const piece = pieces[i];

      if (piece.x === result.x && piece.y < result.y && piece.userid === result.userid) {
        turnlist.n.push(piece);
      } else if (piece.x > result.x && piece.y === result.y && piece.userid === result.userid) {
        console.log("east");
        turnlist.e.push(piece);
      } else if (piece.x === result.x && piece.y > result.y && piece.userid === result.userid) {
        console.log("south");
        turnlist.s.push(piece);
      } else if (piece.x < result.x && piece.y === result.y && piece.userid === result.userid) {
        turnlist.w.push(piece);
        // } else if (piece.x > result.x && piece.y < result.y && piece.userid !== 0
        // && (piece.x - result.x) === (piece.y - result.y)) {
        //   turnlist.ne.push(piece);
        // } else if (piece.x > result.x && piece.y > result.y && piece.userid !== 0
        // && (piece.x - result.x) === (piece.y - result.y)) {
        //   turnlist.se.push(piece);
        // } else if (piece.x < result.x && piece.y < result.y && piece.userid !== 0
        //   && (piece.x - result.x) === (piece.y - result.y)) {
        //   turnlist.sw.push(piece);
        // } else if (piece.x < result.x && piece.y > result.y && piece.userid !== 0) {
        //   turnlist.nw.push(piece);
      } else {

      }
    }

    if (turnlist.n.length !== 0) {
      const sort = { x: 'asc', y: 'desc' };
      turnlist.n = sortList(turnlist.n, sort);
      for (var i = result.y - 1; i > turnlist.n[0].y; i--) {
        await PieceModel.remove({ "x": + turnlist.n[0].x, "y": + i });
        const Piece = new PieceModel({ x: turnlist.n[0].x, y: i, userid: result.userid });
        await Piece.save();
      };
    }

    if (turnlist.e.length !== 0) {
      const sort = { x: 'asc', y: 'asc' };
      turnlist.e = sortList(turnlist.e, sort);
      for (var i = result.x + 1; i < turnlist.e[0].x; i++) {
        await PieceModel.remove({ "x": + i, "y": + turnlist.e[0].y })
        const Piece = new PieceModel({ x: i, y: turnlist.e[0].y, userid: result.userid });
        await Piece.save();
      };
    }

    if (turnlist.s.length !== 0) {
      const sort = { x: 'asc', y: 'asc' };
      turnlist.s = sortList(turnlist.s, sort);
      for (var i = result.y + 1; i < turnlist.s[0].y; i++) {
        await PieceModel.remove({ "x": + turnlist.s[0].x, "y": + i });
        const Piece = new PieceModel({ x: turnlist.s[0].x, y: i, userid: result.userid });
        await Piece.save();
      };
    }

    if (turnlist.w.length !== 0) {
      const sort = { x: 'desc', y: 'asc' };
      turnlist.w = sortList(turnlist.w, sort);
      for (var i = result.x - 1; i > turnlist.w[0].x; i--) {
        await PieceModel.remove({ "x": + i, "y": + turnlist.w[0].y });
        const Piece = new PieceModel({ x: i, y: turnlist.w[0].y, userid: result.userid });
        await Piece.save();
      };
    }
    // if (turnlist.ne.length !== 0) {
    //   turnlist.ne = sortList(turnlist.ne);
    // }
    // if (turnlist.se.length !== 0) {
    //   turnlist.se = sortList(turnlist.se);
    // }
    // if (turnlist.sw.length !== 0) {
    //   turnlist.sw = sortList(turnlist.sw);
    // }
    // if (turnlist.nw.length !== 0) {
    //   turnlist.nw = sortList(turnlist.s);
    // }
    res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;

function sortList(list, sort) {

  if (sort.x === 'asc', sort.y === 'asc') {
    list.sort(function (a, b) {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      return 0;
    });
  } else if (sort.x === 'asc', sort.y === 'desc') {
    list.sort(function (a, b) {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      if (a.y < b.y) return 1;
      if (a.y > b.y) return -1;
      return 0;
    });
  } else if (sort.x === 'desc', sort.y === 'asc') {
    list.sort(function (a, b) {
      if (a.x < b.x) return 1;
      if (a.x > b.x) return -1;
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      return 0;
    });
  } else if (sort.x === 'desc', sort.y === 'desc') {
    list.sort(function (a, b) {
      if (a.x < b.x) return 1;
      if (a.x > b.x) return -1;
      if (a.y < b.y) return 1;
      if (a.y > b.y) return -1;
      return 0;
    });
  } else {
    console.log("need setting sort param");
  }
  return list;
}