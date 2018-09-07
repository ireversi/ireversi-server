
const router = require('express').Router();

const PieceModel = require('../../../../models/kido/PieceModel.js');

const propfilter = '-_id -__v';

function sortList(list, sort) {
  if (sort.x === 'asc' && sort.y === 'asc') {
    list.sort((a, b) => {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      return 0;
    });
  } else if (sort.x === 'asc' && sort.y === 'desc') {
    list.sort((a, b) => {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      if (a.y < b.y) return 1;
      if (a.y > b.y) return -1;
      return 0;
    });
  } else if (sort.x === 'desc' && sort.y === 'asc') {
    list.sort((a, b) => {
      if (a.x < b.x) return 1;
      if (a.x > b.x) return -1;
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      return 0;
    });
  } else if (sort.x === 'desc' && sort.y === 'desc') {
    list.sort((a, b) => {
      if (a.x < b.x) return 1;
      if (a.x > b.x) return -1;
      if (a.y < b.y) return 1;
      if (a.y > b.y) return -1;
      return 0;
    });
  } else {
    // console.log('need setting sort param');
  }
  return list;
}

router.route('/')
  .post(async (req, res) => {
    const pieces = await PieceModel.find({}, propfilter);
    const result = {
      x: +req.body.x,
      y: +req.body.y,
      userid: +req.body.userid,
    };

    // check puts piece same space
    // ============================================================
    if (pieces.find(p => p.x === result.x && p.y === result.y)) {
      res.json(pieces);
      return;
    }
    // ============================================================

    let firstPiece = false;
    if (pieces.length === 0) {
      firstPiece = true;
    }

    let existPiece = false;
    if (pieces.find(p => p.userid === result.userid)) {
      existPiece = true;
    }


    // check turn over
    // ============================================================
    // pick up
    const turnlist = {
      n: [], ne: [], e: [], se: [], s: [], sw: [], w: [], nw: [],
    };
    const existOwnPiece = {
      n: false, ne: false, e: false, se: false, s: false, sw: false, w: false, nw: false,
    };
    const isOtherPiece = {
      n: false, ne: false, e: false, se: false, s: false, sw: false, w: false, nw: false,
    };
    const contactPiece = {
      n: false, ne: false, e: false, se: false, s: false, sw: false, w: false, nw: false,
    };

    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      if (piece.x === result.x && piece.y < result.y) {
        // console.log('north');
        if ((piece.userid === result.userid
          && piece.x === result.x && piece.y < result.y - 1)) {
          existOwnPiece.n = true;
        }
        if ((piece.userid !== result.userid
          && piece.x === result.x && piece.y === result.y - 1)) {
          isOtherPiece.n = true;
        }
        if (piece.y === result.y - 1) { contactPiece.n = true; }
        turnlist.n.push(piece);
      } else if (piece.x > result.x && piece.y === result.y) {
        // console.log('east');
        if (piece.userid === result.userid
          && piece.x > result.x + 1 && piece.y === result.y) {
          existOwnPiece.e = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x + 1 && piece.y === result.y) {
          isOtherPiece.e = true;
        }
        if (piece.x === result.x + 1) { contactPiece.e = true; }
        turnlist.e.push(piece);
      } else if (piece.x === result.x && piece.y > result.y) {
        // console.log('south');
        if (piece.userid === result.userid
          && piece.x === result.x && piece.y > result.y + 1) {
          existOwnPiece.s = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x && piece.y === result.y + 1) {
          isOtherPiece.s = true;
        }
        if (piece.y === result.y + 1) { contactPiece.s = true; }
        turnlist.s.push(piece);
      } else if (piece.x < result.x && piece.y === result.y) {
        // console.log('west');
        if (piece.userid === result.userid
          && piece.x < result.x - 1 && piece.y === result.y) {
          existOwnPiece.w = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x - 1 && piece.y === result.y) {
          isOtherPiece.w = true;
        }
        if (piece.x === result.x - 1) { contactPiece.w = true; }
        turnlist.w.push(piece);
      } else if (piece.x > result.x && piece.y < result.y
        && Math.abs(piece.x - result.x) === Math.abs(piece.y - result.y)) {
        // console.log('northeast');
        if (piece.userid === result.userid && Math.abs(piece.x - result.x) > 1) {
          existOwnPiece.ne = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x + 1 && piece.y === result.y - 1) {
          isOtherPiece.ne = true;
        }
        if (piece.x === result.x + 1 && piece.y === result.y - 1) {
          contactPiece.ne = true;
        }
        turnlist.ne.push(piece);
      } else if (piece.x > result.x && piece.y > result.y
        && Math.abs(piece.x - result.x) === Math.abs(piece.y - result.y)) {
        // console.log('southeast');
        if (piece.userid === result.userid && Math.abs(piece.x - result.x) > 1) {
          existOwnPiece.se = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x + 1 && piece.y === result.y + 1) {
          isOtherPiece.se = true;
        }
        if (piece.x === result.x + 1 && piece.y === result.y + 1) {
          contactPiece.se = true;
        }
        turnlist.se.push(piece);
      } else if (piece.x < result.x && piece.y > result.y
        && Math.abs(piece.x - result.x) === Math.abs(piece.y - result.y)) {
        // console.log('southwest');
        if (piece.userid === result.userid && Math.abs(piece.x - result.x) > 1) {
          existOwnPiece.sw = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x - 1 && piece.y === result.y + 1) {
          isOtherPiece.sw = true;
        }
        if (piece.x === result.x - 1 && piece.y === result.y + 1) {
          contactPiece.sw = true;
        }
        turnlist.sw.push(piece);
      } else if (piece.x < result.x && piece.y < result.y
        && Math.abs(piece.x - result.x) === Math.abs(piece.y - result.y)) {
        // console.log('northwest');
        if (piece.userid === result.userid && Math.abs(piece.x - result.x) > 1) {
          existOwnPiece.nw = true;
        }
        if (piece.userid !== result.userid
          && piece.x === result.x - 1 && piece.y === result.y - 1) {
          isOtherPiece.nw = true;
        }
        if (piece.x === result.x - 1 && piece.y === result.y - 1) {
          contactPiece.nw = true;
        }
        turnlist.nw.push(piece);
      }
    }

    // console.log(existPiece);
    // console.log(contactPiece);
    // console.log(needTurn);
    if (firstPiece) {
      const Piece = new PieceModel(result);
      await Piece.save();
    } else if (!existPiece
      && (contactPiece.n || contactPiece.e
        || contactPiece.s || contactPiece.w)) {
      const Piece = new PieceModel(result);
      await Piece.save();
    } else if (existPiece
      && ((existOwnPiece.n && isOtherPiece.n) || (existOwnPiece.e && isOtherPiece.e)
        || (existOwnPiece.s && isOtherPiece.s) || (existOwnPiece.w && isOtherPiece.w)
        || (existOwnPiece.ne && isOtherPiece.ne) || (existOwnPiece.se && isOtherPiece.se)
        || (existOwnPiece.sw && isOtherPiece.sw) || (existOwnPiece.nw && isOtherPiece.nw))) {
      const Piece = new PieceModel(result);
      await Piece.save();
    }

    if (existOwnPiece.n && isOtherPiece.n) {
      const sort = { x: 'asc', y: 'desc' };
      turnlist.n = sortList(turnlist.n, sort);
      for (let i = 0; i < turnlist.n.length; i += 1) {
        if (turnlist.n[i].userid !== result.userid
          && turnlist.n[i].x === result.x
          && turnlist.n[i].y === result.y - (i + 1)) {
          await PieceModel.remove({ x: +turnlist.n[i].x, y: +turnlist.n[i].y });
          const PieceN = new PieceModel(
            { x: turnlist.n[i].x, y: turnlist.n[i].y, userid: result.userid },
          );
          await PieceN.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.e && isOtherPiece.e) {
      const sort = { x: 'asc', y: 'asc' };
      turnlist.e = sortList(turnlist.e, sort);
      for (let i = 0; i < turnlist.e.length; i += 1) {
        if (turnlist.e[i].userid !== result.userid
          && turnlist.e[i].x === result.x + (i + 1)
          && turnlist.e[i].y === result.y) {
          await PieceModel.remove({ x: +turnlist.e[i].x, y: +turnlist.e[i].y });
          const PieceE = new PieceModel(
            { x: turnlist.e[i].x, y: turnlist.e[i].y, userid: result.userid },
          );
          await PieceE.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.s && isOtherPiece.s) {
      const sort = { x: 'asc', y: 'asc' };
      turnlist.s = sortList(turnlist.s, sort);
      for (let i = 0; i < turnlist.s.length; i += 1) {
        if (turnlist.s[i].userid !== result.userid
          && turnlist.s[i].x === result.x
          && turnlist.s[i].y === result.y + (i + 1)) {
          await PieceModel.remove({ x: +turnlist.s[i].x, y: +turnlist.s[i].y });
          const PieceS = new PieceModel(
            { x: turnlist.s[i].x, y: turnlist.s[i].y, userid: result.userid },
          );
          await PieceS.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.w && isOtherPiece.w) {
      const sort = { x: 'desc', y: 'asc' };
      turnlist.w = sortList(turnlist.w, sort);
      for (let i = 0; i < turnlist.w.length; i += 1) {
        if (turnlist.w[i].userid !== result.userid
          && turnlist.w[i].x === result.x - (i + 1)
          && turnlist.w[i].y === result.y) {
          await PieceModel.remove({ x: +turnlist.w[i].x, y: +turnlist.w[i].y });
          const PieceW = new PieceModel(
            { x: turnlist.w[i].x, y: turnlist.w[i].y, userid: result.userid },
          );
          await PieceW.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.ne) {
      const sort = { x: 'asc', y: 'desc' };
      turnlist.ne = sortList(turnlist.ne, sort);
      for (let i = 0; i < turnlist.ne.length; i += 1) {
        if (turnlist.ne[i].userid !== result.userid
          && turnlist.ne[i].x === result.x + (i + 1)
          && turnlist.ne[i].y === result.y - (i + 1)) {
          await PieceModel.remove({ x: +turnlist.ne[i].x, y: +turnlist.ne[i].y });
          const PieceNE = new PieceModel(
            { x: turnlist.ne[i].x, y: turnlist.ne[i].y, userid: result.userid },
          );
          await PieceNE.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.se) {
      const sort = { x: 'asc', y: 'asc' };
      turnlist.se = sortList(turnlist.se, sort);
      for (let i = 0; i < turnlist.se.length; i += 1) {
        if (turnlist.se[i].userid !== result.userid
          && turnlist.se[i].x === result.x + (i + 1)
          && turnlist.se[i].y === result.y + (i + 1)) {
          await PieceModel.remove({ x: +turnlist.se[i].x, y: +turnlist.se[i].y });
          const PieceSE = new PieceModel(
            { x: turnlist.se[i].x, y: turnlist.se[i].y, userid: result.userid },
          );
          await PieceSE.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.sw) {
      const sort = { x: 'desc', y: 'asc' };
      turnlist.sw = sortList(turnlist.sw, sort);
      for (let i = 0; i < turnlist.sw.length; i += 1) {
        if (turnlist.sw[i].userid !== result.userid
          && turnlist.sw[i].x === result.x - (i + 1)
          && turnlist.sw[i].y === result.y + (i + 1)) {
          await PieceModel.remove({ x: +turnlist.sw[i].x, y: +turnlist.sw[i].y });
          const PieceSW = new PieceModel(
            { x: turnlist.sw[i].x, y: turnlist.sw[i].y, userid: result.userid },
          );
          await PieceSW.save();
        } else {
          break;
        }
      }
    }

    if (existOwnPiece.nw) {
      const sort = { x: 'desc', y: 'desc' };
      turnlist.nw = sortList(turnlist.nw, sort);
      for (let i = 0; i < turnlist.nw.length; i += 1) {
        if (turnlist.nw[i].userid !== result.userid
          && turnlist.nw[i].x === result.x - (i + 1)
          && turnlist.nw[i].y === result.y - (i + 1)) {
          await PieceModel.remove({ x: +turnlist.nw[i].x, y: +turnlist.nw[i].y });
          const PieceNW = new PieceModel(
            { x: turnlist.nw[i].x, y: turnlist.nw[i].y, userid: result.userid },
          );
          await PieceNW.save();
        } else {
          break;
        }
      }
    }
    res.json(await PieceModel.find({}, propfilter));
  });

module.exports = router;
