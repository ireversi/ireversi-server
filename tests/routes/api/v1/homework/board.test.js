const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/homework/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

// const array2Matchers = require('./utils/array2Matchers.js');

// const basePath = '/api/v1';
// const propfilter = '-_id -__v';

function array2Matchers(p) { // 改修必要
  const arry = [];
  const r = Math.sqrt(p.length);
  let obj;
  // let order;
  for (let i = 0; i < p.length; i += 1) {
    obj = {
      x: i % r,
      y: r - Math.floor(i / r) - 1,
      userId: +p[i],
    };
    arry.push(obj);
    // arry.splice(order, 1, obj);
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
        1, 2, 0,
        1, 2, 0,
      ]);

      // console.log(matchers.length);
      await Promise.all(matchers.map(m => new PlayingModel(m).save()));

      // // When
      // const { body } = await chai.request(app).get(`${basePath}/homework/board`);

      // console.log(body);

      // // Then
      // expect(body).toHaveLength(matchers.length);
      // expect(body).toEqual(expect.arrayContaining(matchers));
    });
  });
});
