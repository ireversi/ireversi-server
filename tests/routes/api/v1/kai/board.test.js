const chai = require('chai');

const app = require('../../../../../src/routes/app.js'); // express引っ張ってきてサーバー立てる
const PlayingModel = require('../../../../../src/models/kai/PlayingModel.js'); // Mongoテーブル引っ張ってくる
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

const array = [];
const array2Matchers = (field) => {
  const sqrt = Math.sqrt(field.length);
  for (let i = 0; i < field.length; i += 1) {
    if (field[i] !== 0) {
      const x = i % sqrt;
      const y = Math.floor(((field.length - 1) - i) / sqrt);
      const userId = field[i];
      array.push({ x, y, userId });
    }
  }
  return array;
};

describe('board', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('get pieces', () => {
    it('gets all', async () => {
      // Given
      const matchers = array2Matchers([
        0, 0, 0, 0, 2,
        0, 3, 1, 9, 8,
        0, 1, 3, 0, 0,
        0, 5, 4, 0, 0,
        0, 7, 0, 0, 2,
      ]);
      await Promise.all(matchers.map(m => new PlayingModel(m).save()));
      // When
      // saveしたboard情報をbodyに分割代入
      const { body } = await chai.request(app).get(`${basePath}/kai/board`);

      // Then
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));
    });
  });
});
