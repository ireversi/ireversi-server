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
};
