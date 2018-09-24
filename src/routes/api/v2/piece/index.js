
const router = require('express').Router();
const PieceModel = require('../../../../models/v2/PieceModel.js');

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post((req, res) => {
    const pieces = PieceModel.getPieces();
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userId: +req.body.userId,
    };

    // check to exist piece had already set one
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      return res.json(PieceModel.getPieces());
    }

    // 本来はfirst_pieceで処理するので必要ない、フロントとの連携確認できたら削除
    // check it about first one for all_user
    if (pieces.length === 0) {
      PieceModel.addPiece(result);
      return res.json(PieceModel.getPieces());
    }

    // check it about first one about several user
    let existPiece = false;
    if (pieces.find(p => p.userId === result.userId)) {
      existPiece = true;
    }

    // check turn over
    // ============================================================
    // pick up
    const turnlist = {
      n: [], e: [], s: [], w: [], ne: [], se: [], sw: [], nw: [],
    };
    const isOtherPiece = {
      n: false, e: false, s: false, w: false, ne: false, se: false, sw: false, nw: false,
    };
    const isOwnPiece = {
      n: false, e: false, s: false, w: false, ne: false, se: false, sw: false, nw: false,
    };

    // make list to turn over about eight direction from recent one
    pieces.forEach((p) => {
      if (p.x === result.x && p.y < result.y) {
        if (p.y === result.y - 1 && p.userId !== result.userId) { isOtherPiece.n = true; }
        if (p.userId === result.userId) { isOwnPiece.n = true; }
        turnlist.n.push(p);
      } else if (p.x > result.x && p.y === result.y) {
        if (p.x === result.x + 1 && p.userId !== result.userId) { isOtherPiece.e = true; }
        if (p.userId === result.userId) { isOwnPiece.e = true; }
        turnlist.e.push(p);
      } else if (p.x === result.x && p.y > result.y) {
        if (p.y === result.y + 1 && p.userId !== result.userId) { isOtherPiece.s = true; }
        if (p.userId === result.userId) { isOwnPiece.s = true; }
        turnlist.s.push(p);
      } else if (p.x < result.x && p.y === result.y) {
        if (p.x === result.x - 1 && p.userId !== result.userId) { isOtherPiece.w = true; }
        if (p.userId === result.userId) { isOwnPiece.w = true; }
        turnlist.w.push(p);
      } else if (p.x > result.x && p.y < result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x + 1 && p.y === result.y - 1
          && p.userId !== result.userId) { isOtherPiece.ne = true; }
        if (p.userId === result.userId) { isOwnPiece.ne = true; }
        turnlist.ne.push(p);
      } else if (p.x > result.x && p.y > result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x + 1 && p.y === result.y + 1
          && p.userId !== result.userId) { isOtherPiece.se = true; }
        if (p.userId === result.userId) { isOwnPiece.se = true; }
        turnlist.se.push(p);
      } else if (p.x < result.x && p.y > result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x - 1 && p.y === result.y + 1
          && p.userId !== result.userId) { isOtherPiece.sw = true; }
        if (p.userId === result.userId) { isOwnPiece.sw = true; }
        turnlist.sw.push(p);
      } else if (p.x < result.x && p.y < result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x - 1 && p.y === result.y - 1
          && p.userId !== result.userId) { isOtherPiece.nw = true; }
        if (p.userId === result.userId) { isOwnPiece.nw = true; }
        turnlist.nw.push(p);
      }
    });

    // set first piece for several user
    if (!existPiece && (isOtherPiece.n || isOtherPiece.e || isOtherPiece.s || isOtherPiece.w)) {
      PieceModel.addPiece(result);
      return res.json(PieceModel.getPieces());
    }

    // turn over piece
    Object.keys(turnlist).map((key) => {
      if ((key === 'n' && isOtherPiece.n && isOwnPiece.n)
        || (key === 'w' && isOtherPiece.w && isOwnPiece.w)
        || (key === 'nw' && isOtherPiece.nw && isOwnPiece.nw)) {
        let list = PieceModel.sortList(turnlist[key], { x: -1, y: -1 });
        list = PieceModel.checkList(list, key, result);
        PieceModel.turnOverPiece(list, result);
      } else if ((key === 'e' && isOtherPiece.e && isOwnPiece.e)
        || (key === 's' && isOtherPiece.s && isOwnPiece.s)
        || (key === 'se' && isOtherPiece.se && isOwnPiece.se)) {
        let list = PieceModel.sortList(turnlist[key], { x: 1, y: 1 });
        list = PieceModel.checkList(list, key, result);
        PieceModel.turnOverPiece(list, result);
      } else if (key === 'ne' && isOtherPiece.ne && isOwnPiece.ne) {
        let list = PieceModel.sortList(turnlist[key], { x: 1, y: -1 });
        list = PieceModel.checkList(list, key, result);
        PieceModel.turnOverPiece(list, result);
      } else if (key === 'sw' && isOtherPiece.sw && isOwnPiece.sw) {
        let list = PieceModel.sortList(turnlist[key], { x: -1, y: 1 });
        list = PieceModel.checkList(list, key, result);
        PieceModel.turnOverPiece(list, result);
      }
      return true; // for lint
    });
    return res.json(PieceModel.getPieces());
  })
  .delete((req, res) => {
    PieceModel.deletePieces();
    res.sendStatus(204);
  });

module.exports = router;
