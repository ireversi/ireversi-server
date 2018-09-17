
const chai = require('chai');

const ZERO0 = 0;
const propfilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PieceModel = require('../../../../../src/models/matsui/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

function array2Pieces(pieces) {
  const result = [];
  const square = Math.sqrt(pieces.length);
  for (let i = 0; i < pieces.length; i += 1) {
    if (pieces[i] !== 0 && !Array.isArray(pieces[i])) {
      const data = pieces[i].split(':');
      const order = data[0];
      const userId = data[1];
      const x = i % square;
      const y = Math.floor(i / square);
      result.push([order, x, y, userId]);
    } else if (pieces[i] !== 0 && Array.isArray(pieces[i])) {
      for (let n = 0; n < pieces[i].length; n += 1) {
        const data = pieces[i][n].split(':');
        const order = data[0];
        const userId = data[1];
        const x = i % square;
        const y = Math.floor(i / square);
        result.push([order, x, y, userId]);
      }
    }
  }
  result.sort((a, b) => {
    if (+a[0] > +b[0]) return 1;
    if (+a[0] < +b[0]) return -1;
    return 0;
  });
  return result;
}

function array2Mathcers(result) {
  const data = [];
  const square = Math.sqrt(result.length);
  for (let i = 0; i < result.length; i += 1) {
    if (result[i] !== 0) {
      data.push({
        x: i % square,
        y: Math.floor(i / square),
        userId: result[i],
      });
    }
  }
  return data;
}

function convertToObject(piece) {
  return {
    x: piece[1],
    y: piece[2],
    userId: piece[3],
  };
}


describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  // 一つ駒を置く
  it('put a piece', async () => {
    // Given 前提条件 order:id（なければ不要）
    const pieces = [
      ZERO0, ZERO0,
      '1:1', ZERO0,
    ];

    const result = [
      0, 0,
      1, 0,
    ];

    // When テストの内容
    const record = array2Pieces(pieces);

    let response;
    for (let i = 0; i < record.length; i += 1) {
      const piece = convertToObject(record[i]);
      response = await chai.request(app)
        .post(`${basePath}/matsui/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);
    }

    const resultData = array2Mathcers(result);

    // Then期待する結果と現実の結果
    // fromExpress
    expect(response.body).toHaveLength(resultData.length);
    expect(response.body).toEqual(expect.arrayContaining(resultData));

    // fromMongo
    const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    expect(pieceData).toHaveLength(resultData.length);
    expect(pieceData).toEqual(expect.arrayContaining(resultData));
  });
});
