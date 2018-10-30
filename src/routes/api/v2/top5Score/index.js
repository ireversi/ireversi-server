const router = require('express').Router();
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');

function convertRanking(result) {
  const scores = [];
  // userIdの重複削除
  const ids = new Set(result);
  const idsArr = [...ids];
  const idx = idsArr.indexOf(0);
  if (idx !== -1) {
    idsArr.splice(idx, 1);
  }
  // userIdの各々について検索。score計算。
  idsArr.forEach((elm) => {
    let score = 0;
    result.forEach((cnt) => {
      if (elm === cnt) {
        score += 1;
      }
    });
    const idscore = {
      userId: elm,
      score,
    };
    scores.push(idscore);
  });

  // scoresの並び替え
  const sortedScores = scores.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });
  const slicedScores = sortedScores.slice(0, 5);

  return slicedScores;
}

function genUserIdArr(pieces) {
  const userIdArr = [];
  pieces.forEach((elm) => {
    userIdArr.push(elm.userId);
  });
  return userIdArr;
}

router.route('/').get(async (req, res) => {
  // 全体盤面の取得
  const entireBoard = PieceStore.getPieces();
  // userIdをリスト化
  const userIdArr = genUserIdArr(entireBoard);
  // top5arrをリスト化
  const top5arr = convertRanking(userIdArr);
  res.json(top5arr);
});
module.exports = router;
