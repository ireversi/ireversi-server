const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/matsuda/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

const array2Pieces = (array, width) => array.map(
  (p, idx) => (p !== 0 ? (Array.isArray(p) ? p : [p]).map(f => ({
    n: +f.split(':')[0],
    piece: {
      x: idx % width,
      y: array.length / width - 1 - Math.floor(idx / width),
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

const result2Matchers = (array, width) => array.map((p, idx) => (p > 0 ? {
  x: idx % width,
  y: array.length / width - 1 - Math.floor(idx / width),
  userId: p,
} : null))
  .filter(e => !!e);

const formatPiece = data => ({
  x: data.x,
  y: data.y,
  userId: data.userId,
});

const checkMathces = (array, result, width) => async () => {
  // Given
  const pieces = array2Pieces(array, width);
  const matchers = result2Matchers(result, width);

  // When
  let response;
  for (let i = 0; i < pieces.length; i += 1) {
    response = await chai.request(app)
      .post(`${basePath}/matsuda/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
  }

  // Then
  expect(response.body).toHaveLength(matchers.length);

  const allPiece = await PlayingModel.find({});
  expect(allPiece).toHaveLength(matchers.length);

  for (let i = 0; i < response.body.length; i += 1) {
    expect(matchers).toContainEqual(formatPiece(response.body[i]));
    expect(matchers).toContainEqual(formatPiece(allPiece[0]));
  }
};

describe('Request users', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('preview', () => {
    it('pieces on board', async () => {
      // Given
      await result2Matchers([
        0, 3, 0, 0,
        0, 3, 1, 0,
        0, 3, 0, 0,
        1, 3, 0, 0,
      ], 4).map(d => new PlayingModel(d).save());

      // When
      const response = await chai.request(app)
        .get(`${basePath}/matsuda/playing`);

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
  });

  describe('play', () => {
    it('sets first piece', checkMathces(
      ['1:1'],
      [1],
      1,
    ));

    it('sets multi pieces', checkMathces(
      ['1:1', '2:3', '3:2'],
      [1, 3, 2],
      3,
    ));

    it('cannot set same place', checkMathces(
      [['1:1', '3:2'], '2:3'],
      [1, 3],
      2,
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
      4,
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
      3,
    ));

    it ('can set only turnable cell when exsisting self pieces', checkMathces(
      [
        0, '3:1', 0,
        '1:1', '2:3', '4:1',
      ],
      [
        0, 0, 0,
        1, 1, 1,
      ],
      3,
    ));
  });
});
