const pieces = [];

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  updatePieces(piece) {
    pieces.find((p, i) => {
      if (p.x === piece.x && p.y === piece.y) {
        pieces.splice(i, 1);
        pieces.push(piece);
        return pieces;
      }
      return false;
    });
  },
  deletePieces() {
    pieces.length = 0;
  },
  getPieces() {
    return pieces;
  },
  convert2PieceRecord(pieceArray) {
    const record = [];
    for (let i = 0; i < pieceArray.length; i += 1) {
      const size = Math.sqrt(pieceArray.length);
      const piece = pieceArray[i];
      if (piece !== 0 && !Array.isArray(piece)) {
        const point = piece.indexOf(':');
        const num = piece.slice(0, point);
        const userId = piece.slice(point + 1);
        const x = Math.floor(i % size);
        const y = Math.floor(i / size);
        record.push([num, x, y, userId]);
      } else if (piece !== 0 && Array.isArray(piece)) {
        for (let j = 0; j < piece.length; j += 1) {
          const pie = piece[j];
          const point = pie.indexOf(':');
          const num = pie.slice(0, point);
          const userId = pie.slice(point + 1);
          const x = Math.floor(i % size);
          const y = Math.floor(i / size);
          record.push([num, x, y, userId]);
        }
      }
    }
    record.sort((a, b) => {
      if (+a[0] < +b[0]) return -1;
      if (+a[0] > +b[0]) return 1;
      return 0;
    });
    return record;
  },
  convertPiece(piece) {
    const convert = { x: piece[1], y: piece[2], userId: piece[3] };
    return convert;
  },
  convertComparisonResult(result) {
    const resultArray = [];
    const size = Math.sqrt(result.length);
    for (let i = 0; i < result.length; i += 1) {
      if (result[i] !== 0) {
        const piece = {
          x: Math.floor(i % size),
          y: Math.floor(i / size),
          userId: result[i],
        };
        resultArray.push(piece);
      }
    }
    return resultArray;
  },
  sortList(list, sort) {
    list.sort((a, b) => {
      if (a.x < b.x) return -1 * sort.x;
      if (a.x > b.x) return 1 * sort.x;
      if (a.y < b.y) return -1 * sort.y;
      if (a.y > b.y) return 1 * sort.y;
      return 0; // for lint
    });
    return list;
  },
  checkList(list, key, result) {
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
  },
  turnOverPiece(list, result) {
    this.addPiece(result);
    list.forEach((p) => {
      if (p.userId !== result.userId) {
        const updatePiece = { x: p.x, y: p.y, userId: result.userId };
        this.updatePieces(updatePiece);
      }
    });
  },
};
