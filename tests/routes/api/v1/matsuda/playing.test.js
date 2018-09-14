const chai = require('chai');
// eslint-disable-next-line import/no-extraneous-dependencies
const diff = require('jest-diff');

const app = require('../../../../../src/routes/app.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');
const array2Matchers = require('./testUtils/array2Matchers.js');
const putPieces = require('./testUtils/putPieces.js');
const savePieces = require('./testUtils/savePieces.js');
const getPiecesFromDB = require('./testUtils/getPiecesFromDB.js');
const { basePath } = require('./testUtils/config.js');

const SPACE = 0;

expect.extend({
  toEqualPosition(rec, arg) {
    const sameLength = rec.length === arg.length;
    const notContaining = arg.find(matcher => !rec.find(p => this.equals(p, matcher)));
    const pass = sameLength && !notContaining;
    const message = pass
      ? () => `${this.utils.matcherHint('.not.toBe')
      }\n\n`
          + 'Expected value to not be (using Object.is):\n'
          + `  ${this.utils.printExpected(arg)}\n`
          + 'Received:\n'
          + `  ${this.utils.printReceived(rec)}`
      : () => {
        const diffString = diff(arg, rec, {
          expand: this.expand,
        });
        return (
          `${this.utils.matcherHint('.toBe')
          }\n\n`
            + 'Expected value to be (using Object.is):\n'
            + `  ${this.utils.printExpected(arg)}\n`
            + 'Received:\n'
            + `  ${this.utils.printReceived(rec)}${
              diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
        );
      };

    return { message, pass };
  },
});

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
      const matchers = array2Matchers(pieces);
      await savePieces(pieces);

      // When
      const response = await chai.request(app).get(basePath);

      // Then
      expect(response.body).toEqualPosition(matchers);
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

      const matchers = array2Matchers([
        0, 4, 8, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ]);

      // When
      const response = await chai.request(app).get(basePath).query(range);

      // Then
      expect(response.body).toEqualPosition(matchers);
    });
  });

  describe('play', () => {
    it('sets first piece', async () => {
      const pieces = await putPieces(['1:1']);
      const matchers = array2Matchers([1]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });

    it('sets multi pieces', async () => {
      const pieces = await putPieces([
        SPACE, SPACE, SPACE,
        SPACE, SPACE, SPACE,
        '1:1', '2:3', '3:2',
      ]);

      const matchers = array2Matchers([
        0, 0, 0,
        0, 0, 0,
        1, 3, 2,
      ]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });

    it('cannot set same place', async () => {
      const pieces = await putPieces([
        [SPACE, SPACE], SPACE,
        ['1:1', '3:2'], '2:3',
      ]);

      const matchers = array2Matchers([
        0, 0,
        1, 3,
      ]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });

    it('turns sandwiched pieces', async () => {
      const pieces = await putPieces([
        SPACE, '6:3', SPACE, SPACE,
        SPACE, '5:2', '4:1', SPACE,
        SPACE, '3:2', SPACE, SPACE,
        '1:1', '2:3', SPACE, SPACE,
      ]);

      const matchers = array2Matchers([
        0, 3, 0, 0,
        0, 3, 1, 0,
        0, 3, 0, 0,
        1, 3, 0, 0,
      ]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });

    it('cannot set remote cell', async () => {
      const pieces = await putPieces([
        '2:2', SPACE, SPACE,
        SPACE, '3:2', SPACE,
        '1:1', '4:3', SPACE,
      ]);

      const matchers = array2Matchers([
        0, 0, 0,
        0, 0, 0,
        1, 3, 0,
      ]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });

    it('can set only turnable cell when exsisting self pieces', async () => {
      const pieces = await putPieces([
        SPACE, SPACE, SPACE,
        SPACE, '3:1', SPACE,
        '1:1', '2:3', '4:1',
      ]);

      const matchers = array2Matchers([
        0, 0, 0,
        0, 0, 0,
        1, 1, 1,
      ]);

      expect(pieces).toEqualPosition(matchers);
      expect(await getPiecesFromDB()).toEqualPosition(matchers);
    });
  });
});
