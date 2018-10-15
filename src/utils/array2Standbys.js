const array2Matchers = require('./array2Matchers.js');

module.exports = {
  array2Standbys(array) {
    const results = [];
    const matchArray = array2Matchers.array2Matchers(array);
    for (let i = 0; i < matchArray.length; i += 1) {
      const match = matchArray[i];
      const result = {
        status: match.status,
        standby: {
          piece: match.piece,
        },
      };
      results.push(result);
    }
    return results;
  },
};
