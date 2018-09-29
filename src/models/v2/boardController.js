// ありとあらゆる配列が入る
// 取りあえず初期値
const pieces = [];
const candidates = [];
const standbys = [];
let score = 0;
let gSize = {};

function convertComparisonResult(result) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size),
        y: Math.floor(i / size),
        userId: result[i].userId,
      };
      fPieces.push(piece);
    }
  }
  return fPieces;
}

// いったん数値仮置き
const result = [
  0, 0, 0, 0, 0,
  0, 1, 2, 1, 0,
  4, 5, 6, 7, 1,
  0, 9, 0, 2, 0,
  0, 0, 0, 0, 0,
];

const rPieces = convertComparisonResult(result);
rPieces.forEach((elm) => {
  pieces.push(elm);
});

module.exports = {
  addPiece(piece) {
    pieces.push(piece);
  },
  addCandidates(candidate) {
    candidates.push(candidate);
  },
  addScore(valscore) {
    score = valscore;
  },
  addSize(boardSize) {
    gSize = boardSize;
  },
  getBoard() {
    return {
      pieces,
      candidates,
      standbys,
      score,
      size: gSize,
    };
  },
};
