exports.calc = function calcSize(pieces) {
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;

  let counter = 0;
  pieces.forEach((elm) => {
    // piecesの各要素のうちuserIdに該当するもの
    // if (elm.userId === userId) {
    if (counter === 0) {
      xMin = elm.x;
      xMax = elm.x;
      yMin = elm.y;
      yMax = elm.y;
      counter += 1;
    } else {
      // xの条件式
      if (elm.x > xMax) {
        xMax = elm.x;
      }
      if (elm.x < xMin) {
        xMin = elm.x;
      }

      // yの条件式
      if (elm.y > yMax) {
        yMax = elm.y;
      }
      if (elm.y < yMin) {
        yMin = elm.y;
      }
    // }
    }
  });
  const ans = {
    xMin,
    xMax,
    yMin,
    yMax,
  };
  return ans;
};
