const pieces = [];

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  getPieces() {
    return {
      pieces,
    };
  },
};
