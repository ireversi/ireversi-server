const chai = require('chai');

// const propFilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

// ==========================================
function array2matchers(testCase) {
  const resultArray = [];

  // square check
  const square = Math.sqrt(testCase.length);
  if (Math.round(square) !== square) {
    return false;
  }

  testCase.forEach((elm, index) => {
    if (elm !== 0) {
      const posX = index % square;
      const posY = Math.floor(index / square);
      const tempObj = {
        x: posX,
        y: posY,
        userId: elm,
      };
      resultArray.push(tempObj);
    }
  });
  return resultArray;
}

describe('play', () => {
  beforeAll(prepareDB); // 全てのテストをやる前に1回だけ呼ばれる。
  afterEach(deleteAllDataFromDB);

  // ここからtaskで作成したテスト
  describe('get board', () => {
    it('gets all pieces', async () => {
      // Given
      const matchers = array2matchers(
        [
          0, 0, 1, 2,
          0, 4, 3, 0,
          0, 5, 0, 0,
          0, 6, 0, 0,
        ],
      );
        // When
      await Promise.all(matchers.map(m => new PlayingModel(m).save()));
      // Then
      const { body } = await chai.request(app).get(`${basePath}/kohski/board`);
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));
    });
  });
});
