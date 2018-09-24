const router = require('express').Router();
const PieceModel = require('../../../../models/v2/PieceModel.js');

function sortList(list, sort) {
  list.sort((a, b) => {
    if (a.x < b.x) return -1 * sort.x;
    if (a.x > b.x) return 1 * sort.x;
    if (a.y < b.y) return -1 * sort.y;
    if (a.y > b.y) return 1 * sort.y;
    return 0; // for lint
  });
  return list;
}

function checkList(list, key, result) {
  const newList = [];
  if (key === 'n' || key === 's') {
    for (let i = 0; i < list.length; i += 1) {
      if (i === 0) {
        newList.push(list[i]);
      } else if (list[i].userId !== result.userId
        && Math.abs(list[i].y - list[i - 1].y) === 1) {
        newList.push(list[i]);
      } else if (list[i].userId === result.userId
        && Math.abs(list[i].y - list[i - 1].y) === 1) {
        return newList;
      } else {
        newList.length = 0;
        return newList;
      }
    }
  } else if (key === 'w' || key === 'e') {
    for (let i = 0; i < list.length; i += 1) {
      if (i === 0) {
        newList.push(list[i]);
      } else if (i > 0 && list[i].userId !== result.userId
        && Math.abs(list[i].x - list[i - 1].x) === 1) {
        newList.push(list[i]);
      } else if (i > 0 && list[i].userId === result.userId
        && Math.abs(list[i].x - list[i - 1].x) === 1) {
        return newList;
      } else {
        newList.length = 0;
        return newList;
      }
    }
  } else {
    for (let i = 0; i < list.length; i += 1) {
      if (i === 0) {
        newList.push(list[i]);
      } else if (i > 0 && list[i].userId !== result.userId
        && (Math.abs(list[i].x - list[i - 1].x) === 1)
        && (Math.abs(list[i].y - list[i - 1].y) === 1)) {
        newList.push(list[i]);
      } else if (i > 0 && list[i].userId === result.userId
        && (Math.abs(list[i].x - list[i - 1].x) === 1)
        && (Math.abs(list[i].y - list[i - 1].y) === 1)) {
        return newList;
      } else {
        newList.length = 0;
        return newList;
      }
    }
  }
  return newList;
}

function turnOverPiece(list, result) {
  PieceModel.addPiece(result);
  list.forEach((p) => {
    if (p.userId !== result.userId) {
      const updatePiece = { x: p.x, y: p.y, userId: result.userId };
      PieceModel.updatePieces(updatePiece);
    }
  });
}


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
        let list = sortList(turnlist[key], { x: -1, y: -1 });
        list = checkList(list, key, result);
        turnOverPiece(list, result);
      } else if ((key === 'e' && isOtherPiece.e && isOwnPiece.e)
        || (key === 's' && isOtherPiece.s && isOwnPiece.s)
        || (key === 'se' && isOtherPiece.se && isOwnPiece.se)) {
        let list = sortList(turnlist[key], { x: 1, y: 1 });
        list = checkList(list, key, result);
        turnOverPiece(list, result);
      } else if (key === 'ne' && isOtherPiece.ne && isOwnPiece.ne) {
        let list = sortList(turnlist[key], { x: 1, y: -1 });
        list = checkList(list, key, result);
        turnOverPiece(list, result);
      } else if (key === 'sw' && isOtherPiece.sw && isOwnPiece.sw) {
        let list = sortList(turnlist[key], { x: -1, y: 1 });
        list = checkList(list, key, result);
        turnOverPiece(list, result);
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
