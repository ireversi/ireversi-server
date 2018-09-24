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
};
