const chai = require('chai');

const propFilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';


function array2pieces(testCase) {
  // check whether given 2d array is square or not
  const yLength = testCase.length;
  let xLength = 0;
  let squareLength = 0;
  testCase.forEach((element) => {
    tempLength = element.length;
    if (tempLength > xLength) {
      xLength = tempLength;
    }
  });
  if (xLength !== yLength) {
    return false; // escape this function
  }
  squareLength = xLength; // adopt the square length


  // clowring each elements
  let count = 0;
  const tempResult = [];
  testCase.forEach((row) => {
    row.forEach((column) => {
      if (typeof (column) === 'object') {
        column.forEach((piece) => {
          tempResult.push([count, piece]);
        });
      } else {
        tempResult.push([count, column]);
      }
      count += 1;
    });
  });

  // processing tempResult
  const result = [];
  tempResult.forEach((element) => {
    const index = Number(element[0]);
    const x = index % squareLength;
    const y = Math.floor(index / squareLength);
    const piece = element[1];

    if (typeof (piece) === 'string') {
      const userID = Number(piece.split(':')[0]);
      const turn = Number(piece.split(':')[1]);
      const tempObj = {
        x, y, userID, turn,
      };
      result.push(tempObj);
    } else if (typeof (piece) === 'number' && piece !== 0) {
      userID = piece;
      tempObj = { x, y, userID };
      result.push(tempObj);
    }
  });

  // sort tempResult by turn
  result.sort((a, b) => {
    if (a.turn < b.turn) return -1;
    if (a.turn > b.turn) return 1;
    return 0;
  });

  // delete property"turn"
  result.forEach((element) => {
    const temp = element;
    delete temp.turn;
  });
  return result;
}

describe('play', () => {
  beforeAll(prepareDB); // 全てのテストをやる前に1回だけ呼ばれる。
  afterEach(deleteAllDataFromDB);

  // ここからtaskで作成したテスト
  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece = array2pieces(
        [
          ['1:1', 0],
          [0, 0],
        ],
      );
      const matchers = array2pieces(
        [
          [1, 0],
          [0, 0],
        ],
      );
      // When
      const response = await chai.request(app)
        .post(`${basePath}/kohski/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece[0]);

      // Then
      expect(response.body).toHaveLength(piece.length);
      expect(response.body).toMatchObject(matchers);

      const pieces = await PlayingModel.find({});
      expect(pieces).toHaveLength(piece.length);
      expect(pieces).toMatchObject(matchers);
    });
    it('puts multi pieces', async () => {
      // Given
      const pieces = array2pieces(
        [
          ['1:1', '2:2'],
          [0, 0],
        ],
      );

      const matchers = array2pieces(
        [
          [1, 2],
          [0, 0],
        ],
      );

      // When
      let response;

      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/kohski/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // ThenExpressからの配列
      expect(response.body).toHaveLength(pieces.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(pieces.length);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });

    // 同じところに置けないテスト
    it('cannot be put on same place', async () => {
    // Given
      const pieces = array2pieces(
        [[['1:1', '2:2'], 0],
          ['3:3', 0]],
      );
      const matchers = array2pieces(
        [
          [1, 0],
          [3, 0],
        ],
      );

      // When
      let response;

      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/kohski/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      // expressの検証
      expect(response.body).toHaveLength(pieces.length - 1);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(pieces.length - 1);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });

    // 挟んだらめくれるテスト
    it('turnover pieces', async () => {
      // Given
      const pieces = array2pieces(
        [
          ['1:6', '2:4', '1:1', 0],
          ['2:2', 0, 0, 0],
          ['3:3', 0, 0, 0],
          ['1:5', 0, 0, 0],
        ],
      );
      const matchers = array2pieces(
        [
          [1, 1, 1, 0],
          [1, 0, 0, 0],
          [1, 0, 0, 0],
          [1, 0, 0, 0],
        ],
      );

      // When
      let response;

      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/kohski/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      // expressの検証
      expect(response.body).toHaveLength(pieces.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(pieces.length);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });

    // はなれたところにおけないテスト
    // 自分のがあったらめくれるところにしかおけない
  });
});
