// ありとあらゆる配列が入る
// 取りあえず初期値
const pieces = [];
const candidates = [];
const standbys = [];
let score = 0;

function convertComparisonResult(result) {
  const fPieces = [];
  const size = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      const piece = {
        x: Math.floor(i % size),
        y: Math.floor(i / size),
        userId: result[i],
      };
      fPieces.push(piece);
    }
  }
  return fPieces;
}

const result = [
  0, 0, 0, 0, 0,
  0, 1, 2, 3, 0,
  4, 5, 6, 7, 8,
  0, 9, 0, 0, 0,
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
  getBoard() {
    return {
      pieces,
      candidates,
      standbys,
      score,
    };
  },
};
