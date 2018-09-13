
const router = require('express').Router();

const PieceModel = require('../../../../models/kido/PieceModel.js');

const propfilter = '-_id -__v';

function sortList(list, sort) {
  list.sort((a, b) => {
    if (a.x < b.x) return -1 * sort.x;
    if (a.x > b.x) return 1 * sort.x;
    if (a.y < b.y) return -1 * sort.y;
    if (a.y > b.y) return 1 * sort.y;
    return 0;
  });
  return list;
}

async function turnOverPiece(list, result) {
  let check = true;
  await new PieceModel(result).save();
  await Promise.all(list.map(async (p) => {
    if (p.userid !== result.userid && check) {
      await PieceModel.update({ x: p.x, y: p.y }, { $set: { userid: result.userid } });
    } else {
      check = false;
    }
  }));
}

// for CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.route('/')
  .post(async (req, res) => {
    const pieces = await PieceModel.find({}, propfilter).sort({ x: 1, y: 1 });
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userid: +req.body.userid,
    };

    // check to exist piece had already set one
    if (await pieces.find(p => p.x === result.x && p.y === result.y)) {
      return res.json(await PieceModel.find({}, propfilter));
    }

    // check it about first one for all_user
    if (pieces.length === 0) {
      await new PieceModel(result).save();
      return res.json(await PieceModel.find({}, propfilter));
    }

    // check it about first one about several user
    let existPiece = false;
    if (await pieces.find(p => p.userid === result.userid)) {
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
        if (p.y === result.y - 1 && p.userid !== result.userid) { isOtherPiece.n = true; }
        if (p.userid === result.userid) { isOwnPiece.n = true; }
        turnlist.n.push(p);
      } else if (p.x > result.x && p.y === result.y) {
        if (p.x === result.x + 1 && p.userid !== result.userid) { isOtherPiece.e = true; }
        if (p.userid === result.userid) { isOwnPiece.e = true; }
        turnlist.e.push(p);
      } else if (p.x === result.x && p.y > result.y) {
        if (p.y === result.y + 1 && p.userid !== result.userid) { isOtherPiece.s = true; }
        if (p.userid === result.userid) { isOwnPiece.s = true; }
        turnlist.s.push(p);
      } else if (p.x < result.x && p.y === result.y) {
        if (p.x === result.x - 1 && p.userid !== result.userid) { isOtherPiece.w = true; }
        if (p.userid === result.userid) { isOwnPiece.w = true; }
        turnlist.w.push(p);
      } else if (p.x > result.x && p.y < result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x + 1 && p.y === result.y - 1
          && p.userid !== result.userid) { isOtherPiece.ne = true; }
        if (p.userid === result.userid) { isOwnPiece.ne = true; }
        turnlist.ne.push(p);
      } else if (p.x > result.x && p.y > result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x + 1 && p.y === result.y + 1
          && p.userid !== result.userid) { isOtherPiece.se = true; }
        if (p.userid === result.userid) { isOwnPiece.se = true; }
        turnlist.se.push(p);
      } else if (p.x < result.x && p.y > result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x - 1 && p.y === result.y + 1
          && p.userid !== result.userid) { isOtherPiece.sw = true; }
        if (p.userid === result.userid) { isOwnPiece.sw = true; }
        turnlist.sw.push(p);
      } else if (p.x < result.x && p.y < result.y
        && Math.abs(p.x - result.x) === Math.abs(p.y - result.y)) {
        if (p.x === result.x - 1 && p.y === result.y - 1
          && p.userid !== result.userid) { isOtherPiece.nw = true; }
        if (p.userid === result.userid) { isOwnPiece.nw = true; }
        turnlist.nw.push(p);
      }
    });

    // set first piece for several user
    if (!existPiece && (isOtherPiece.n || isOtherPiece.e || isOtherPiece.s || isOtherPiece.w)) {
      await new PieceModel(result).save();
      return res.json(await PieceModel.find({}, propfilter));
    }

    // turn over piece
    await Promise.all(Object.keys(turnlist).map(async (key) => {
      if ((key === 'n' && isOtherPiece.n && isOwnPiece.n)
        || (key === 'w' && isOtherPiece.w && isOwnPiece.w)
        || (key === 'nw' && isOtherPiece.nw && isOwnPiece.nw)) {
        const list = sortList(turnlist[key], { x: -1, y: -1 });
        await turnOverPiece(list, result);
      } else if ((key === 'e' && isOtherPiece.e && isOwnPiece.e)
        || (key === 's' && isOtherPiece.s && isOwnPiece.s)
        || (key === 'se' && isOtherPiece.se && isOwnPiece.se)) {
        const list = sortList(turnlist[key], { x: 1, y: 1 });
        await turnOverPiece(list, result);
      } else if (key === 'ne' && isOtherPiece.ne && isOwnPiece.ne) {
        const list = sortList(turnlist[key], { x: 1, y: -1 });
        await turnOverPiece(list, result);
      } else if (key === 'sw' && isOtherPiece.sw && isOwnPiece.sw) {
        const list = sortList(turnlist[key], { x: -1, y: 1 });
        await turnOverPiece(list, result);
      }
    }));
    return res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;
