exports.calc = function calcScore(id, pieces) {
  let score = 0;

  pieces.forEach((element) => {
    if (element.id === id) {
      score += 1;
    }
  });
  return score;
};
