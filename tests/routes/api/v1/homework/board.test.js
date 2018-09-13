const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/fujii/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

// const array2Matchers = require('./utils/array2Matchers.js');

const basePath = '/api/v1';
// const propfilter = '-_id -__v';

function array2Matchers(p) { // 改修必要
  const arry = [];
  const r = Math.sqrt(p.length);
  for (let i = 0; i < p.length; i += 1) {
    if (p[i] !== 0) {
      const obj = {
        x: i % r,
        y: Math.floor(i / r),
        userId: p[i],
      };
      arry.push(obj);
    }
  }
  return arry;
}

describe('board', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('get pieces', () => {
    it('gets all', async () => {
      // Given
      const matchers = array2Matchers([
        0, 0, 0,
        4, 3, 0,
        1, 2, 0,
      ]);
      await Promise.all(matchers.map(m => new PlayingModel(m).save()));
      // // When
      const { body } = await chai.request(app).get(`${basePath}/fujii/board`);
      // // Then
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));
    });
  });
});
