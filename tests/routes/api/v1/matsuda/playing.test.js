const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/matsuda/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1/matsuda/playing';
const propFilter = '-_id -__v';

const array2Pieces = array => array.map(
  (p, idx) => (p !== 0 ? (Array.isArray(p) ? p : [p]).map(f => ({
    n: +f.split(':')[0],
    piece: {
      x: idx % Math.sqrt(array.length),
      y: array.length / Math.sqrt(array.length) - 1 - Math.floor(idx / Math.sqrt(array.length)),
      userId: +f.split(':')[1],
    },
  })) : null),
)
  .filter(e => !!e)
  .reduce((prev, current) => [
    ...prev,
    ...Array.isArray(current) ? current : [current],
  ], [])
  .sort((a, b) => a.n - b.n)
  .map(p => p.piece);

const result2Matchers = array => array.map((p, idx) => (p > 0 ? {
  x: idx % Math.sqrt(array.length),
  y: array.length / Math.sqrt(array.length) - 1 - Math.floor(idx / Math.sqrt(array.length)),
  userId: p,
} : null))
  .filter(e => !!e);

// expect.extend({
//   toPut(rec, arg) {
//     const sameLength = rec.length === arg.length;
//     const notContaining = arg.find(matcher => !rec.find(p => this.equals(p, matcher)));
//   },
// });

const checkSame = (pieces, matchers) => {
  expect(pieces).toHaveLength(matchers.length);
  expect(pieces).toEqual(expect.arrayContaining(matchers));
};

const checkMathces = (array, result) => async () => {
  // Given
  const pieces = array2Pieces(array);
  const matchers = result2Matchers(result);

  // When
  let response;
  for (let i = 0; i < pieces.length; i += 1) {
    response = await chai.request(app)
      .post(basePath)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
  }

  // Then
  checkSame(response.body, matchers);

  const allPiece = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
  checkSame(allPiece, matchers);
};

const savePieces = array => Promise.all(result2Matchers(array).map(d => new PlayingModel(d).save()));

describe('Board', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('preview', () => {
    it('all pieces', async () => {
      // Given
      await savePieces([
        0, 3, 0, 0,
        0, 3, 1, 0,
        0, 3, 0, 0,
        1, 3, 0, 0,
      ]);

      // When
      const response = await chai.request(app).get(`${basePath}/graph`);

      // Then
      expect(response.text).toBe(`
  Y
    ┌────┬────┬────┐
  3 │    │  3 │    │
    ├────┼────┼────┤
  2 │    │  3 │  1 │
    ├────┼────┼────┤
  1 │    │  3 │    │
    ├────┼────┼────┤
  0 │  1 │  3 │    │
    └────┴────┴────┘
       0    1    2   X
`.slice(1, -1));
    });

    it('assign range pieces', async () => {
      // Given
      await savePieces([
        0, 3, 0, 0,
        0, 3, 1, 0,
        0, 3, 0, 0,
        1, 3, 0, 0,
      ]);

      const range = {
        t: 5,
        b: 2,
        l: -1,
        r: 4,
      };

      // When
      const response = await chai.request(app)
        .get(`${basePath}/graph`)
        .query(range);

      // Then
      expect(response.text).toBe(`
  Y
    ┌────┬────┐
  3 │  3 │    │
    ├────┼────┤
  2 │  3 │  1 │
    └────┴────┘
       1    2   X
`.slice(1, -1));
    });
  });

  describe('get status', () => {
    it('get all', async () => {
      // Given
      const pieces = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0,
      ];
      const matchers = result2Matchers(pieces);
      await savePieces(pieces);

      // When
      const response = await chai.request(app).get(basePath);

      // Then
      checkSame(response.body, matchers);
    });

    it('assign range', async () => {
      // Given
      await savePieces([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0,
      ]);

      const range = {
        t: 5,
        b: 3,
        l: -1,
        r: 2,
      };

      const matchers = result2Matchers([
        0, 4, 8, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ]);

      // When
      const response = await chai.request(app).get(basePath).query(range);

      // Then
      checkSame(response.body, matchers);
    });
  });

  describe('play', () => {
    it('sets first piece', checkMathces(
      ['1:1'],
      [1],
    ));

    it('sets multi pieces', checkMathces(
      [
        0, 0, 0,
        0, 0, 0,
        '1:1', '2:3', '3:2',
      ],
      [
        0, 0, 0,
        0, 0, 0,
        1, 3, 2,
      ],
    ));

    it('cannot set same place', checkMathces(
      [
        0, 0,
        ['1:1', '3:2'], '2:3',
      ],
      [
        0, 0,
        1, 3,
      ],
    ));

    it('turns sandwiched pieces', checkMathces(
      [
        0, '6:3', 0, 0,
        0, '5:2', '4:1', 0,
        0, '3:2', 0, 0,
        '1:1', '2:3', 0, 0,
      ],
      [
        0, 3, 0, 0,
        0, 3, 1, 0,
        0, 3, 0, 0,
        1, 3, 0, 0,
      ],
    ));

    it('cannot set remote cell', checkMathces(
      [
        '2:2', 0, 0,
        0, '3:2', 0,
        '1:1', '4:3', 0,
      ],
      [
        0, 0, 0,
        0, 0, 0,
        1, 3, 0,
      ],
    ));

    it('can set only turnable cell when exsisting self pieces', checkMathces(
      [
        0, 0, 0,
        0, '3:1', 0,
        '1:1', '2:3', '4:1',
      ],
      [
        0, 0, 0,
        0, 0, 0,
        1, 1, 1,
      ],
    ));
  });
});
