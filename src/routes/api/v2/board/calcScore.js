exports.calc = function calcScore(userId, pieces) {
  let score = 0;
  pieces.forEach((element) => {
    if (element.userId === userId) {
      score += 1;
    }
  });
  return score;
};
