const chai = require('chai');

const propFilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

// テストケース成型用の関数
function array2pieces(testCase) {
  // square check
  const square = Math.sqrt(testCase.length);
  if (Math.round(square) !== square) {
    return false;
  }
  // chekcking elements
  const tempResult = [];

  // 一次元の配列に入力していく
  testCase.forEach((elm, index) => {
    if (typeof (elm) === 'object') {
      elm.forEach((element) => {
        tempResult.push(
          {
            content: element,
            position: index,
          },
        );
      });
    } else {
      tempResult.push(
        {
          content: elm,
          position: index,
        },
      );
    }
  });
  // x,y,content,turnに分割していく。
  const resultArray = [];
  tempResult.forEach((elm) => {
    if (elm.content !== 0) {
      const ans = elm.content.split(':');
      const userId = ans[0];
      const turn = ans[1];
      const posX = elm.position % square;
      const posY = Math.floor(elm.position / square);
      const ansObj = {
        x: posX,
        y: posY,
        userId: Number(userId),
        turn: Number(turn),
      };
      resultArray.push(ansObj);
    }
  });
  // sort tempResult by turn
  resultArray.sort((a, b) => {
    if (a.turn < b.turn) return -1;
    if (a.turn > b.turn) return 1;
    return 0;
  });

  // delete property"turn"
  resultArray.forEach((element) => {
    const temp = element;
    delete temp.turn;
  });
  return resultArray;
}


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
  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece = array2pieces(
        [
          '1:1', 0,
          0, 0,
        ],
      );
      const matchers = array2matchers(
        [
          1, 0,
          0, 0,
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
          '1:1', '2:2',
          0, 0,
        ],
      );

      const matchers = array2matchers(
        [
          1, 2,
          0, 0,
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
        [
          ['1:1', '2:2'], 0,
          '3:3', 0,
        ],
      );
      const matchers = array2matchers(
        [
          1, 0,
          3, 0,
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
          '1:1', '4:3', '5:5', '1:8',
          '2:2', '6:6', 0, 0,
          '3:4', 0, '1:9', 0,
          '1:7', 0, 0, 0,
        ],
      );
      const matchers = array2matchers(
        [
          1, 1, 1, 1,
          1, 1, 0, 0,
          1, 0, 1, 0,
          1, 0, 0, 0,
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
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });

    // はなれたところにおけないテスト
    it('cannot put piece on remote position', async () => {
      // Given
      const pieces = array2pieces(
        [
          '1:1', 0, 0,
          0, 0, 0,
          '2:2', 0, 0,
        ],
      );
      const matchers = array2matchers(
        [
          1, 0, 0,
          0, 0, 0,
          0, 0, 0,
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
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });

    // 自分のがあったらめくれるところにしかおけない
    it('cannot put on the cell only when you turnover some pieces', async () => {
      // Given
      const pieces = array2pieces(
        [
          '1:1', '1:1', 0,
          '2:2', 0, 0,
          0, 0, 0,
        ],
      );
      const matchers = array2matchers(
        [
          1, 0, 0,
          2, 0, 0,
          0, 0, 0,
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
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      // mongodbの検証
      const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toEqual(expect.arrayContaining(matchers));
    });
  });
});
