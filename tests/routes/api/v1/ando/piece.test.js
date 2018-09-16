const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PieceModel = require('../../../../../src/models/ando/PieceModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

const propFilter = '-_id -__v';

// baseArrayはオプション
function array2Pieces(requestArray, baseArray) {
  // フィールドのサイズ算出
  const fieldSize = Math.sqrt(requestArray.length);

  // basePosition: 左下の座標を示す
  // baseArrayが指定されていなければ、初期値を使用
  const basePosition = baseArray || [0, 0];
  const result = [];

  for (let i = 0; i < requestArray.length; i += 1) {
    // データがあるときのみ処理
    if (requestArray[i] !== 0) {
      // 1マスにデータが複数あるとき
      const positionX = basePosition[0] + (i % fieldSize);
      const positionY = basePosition[1] + fieldSize - 1
                          - Math.floor((i - (i % fieldSize)) / fieldSize);
      if (Array.isArray(requestArray[i])) {
        for (let j = 0; j < requestArray[i].length; j += 1) {
          const pieceData = {
            x: positionX,
            y: positionY,
            userId: +requestArray[i][j].split(':')[0],
            order: +requestArray[i][j].split(':')[1],
          };
          result.push(pieceData);
        }
      // 1マスにデータが1つのとき
      } else {
        const pieceData = {
          x: positionX,
          y: positionY,
          userId: +requestArray[i].split(':')[0],
          order: +requestArray[i].split(':')[1],
        };
        result.push(pieceData);
      }
    }
  }

  // オーダー順に並び替え
  result.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  });

  return result;
}

function array2Matchers(exceptArray, baseArray) {
  // 基本的な処理は、array2Pieces関数と共通なので、処理できるようデータ整形
  const treatedExceptArray = exceptArray;
  for (let i = 0; i < treatedExceptArray.length; i += 1) {
    if (treatedExceptArray[i] !== 0) {
      const pieceData = `${treatedExceptArray[i]}:0`;
      treatedExceptArray[i] = pieceData;
    }
  }

  const result = array2Pieces(treatedExceptArray, baseArray);

  // Matcherはオーダーは不要なので削除
  for (let i = 0; i < result.length; i += 1) {
    delete result[i].order;
  }

  return result;
}

describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece = {
        x: 0,
        y: 0,
        userId: 1,
      };

      // When
      const response = await chai.request(app)
        .post(`${basePath}/ando/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(piece);

      const pieces = await PieceModel.find();
      expect(pieces).toHaveLength(1);
      expect(pieces[0]).toMatchObject(piece);
    });
    it('puts pieces', async () => {
      // Given
      const pieces = [
        {
          x: 0,
          y: 0,
          userId: 1,
        },
        {
          x: 1,
          y: 0,
          userId: 2,
        },
      ];

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/ando/piece`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      expect(response.body).toHaveLength(pieces.length);
      expect(response.body).toEqual(expect.arrayContaining(pieces));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(pieces.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(pieces));
    });

    // 同じところに置けないテスト
    it('cannon put same cell', async () => {
      // Given
      const pieces = array2Pieces([
        0, '1:3', 0, 0,
        0, ['2:2', '8:5'], 0, 0,
        0, '1:1', '3:4', 0,
        0, 0, 0, 0,
      ]);

      const matchers = array2Matchers([
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 3, 0,
        0, 0, 0, 0,
      ]);

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/ando/piece`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(matchers));
    });

    // はさんだらめくれるテスト
    it('turns over pieces between setting piece and other own pieces', async () => {
      // Given
      const pieces = array2Pieces([
        0.000, '1:4', 0.000, 0.000,
        0.000, '2:2', 0.000, 0.000,
        '3:6', '1:1', '3:3', 0.000,
        0.000, 0.000, '2:5', '1:7',
      ]);

      const matchers = array2Matchers([
        0, 1, 0, 0,
        0, 1, 0, 0,
        3, 3, 1, 0,
        0, 0, 2, 1,
      ]);

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/ando/piece`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(matchers));
    });

    // 離れたところに置けないテスト（1回目は上下左右のみ）
    it('cannon put a piece at a distance from other pieces', async () => {
      // Given
      const pieces = array2Pieces([
        '2:2', 0.000, 0.000, 0.000, 0,
        0.000, 0.000, 0.000, '3:4', 0,
        0.000, 0.000, '1:1', 0.000, 0,
        0.000, '3:5', '2:3', 0.000, 0,
        '1:6', 0.000, 0.000, 0.000, 0,
      ], [-2, -2]);

      const matchers = array2Matchers([
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 1, 2, 0, 0,
        1, 0, 0, 0, 0,
      ], [-2, -2]);

      // When
      let response;
      for (let i = 0; i < pieces.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/ando/piece`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(pieces[i]);
      }

      // Then
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(matchers));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(matchers));
    });

    // 既に自分のコマがあるときは、めくれるところにしか置けないテスト
  });

  describe('delete peces', () => {
    it('deletes all', async () => {
      // Given
      const pieces = array2Matchers([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0,
      ]);

      await Promise.all(pieces.map(m => new PieceModel(m).save()));

      const keyword = 'deleteAll';

      const matchers = array2Matchers([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
      ]);

      // When
      const { body } = await chai.request(app)
        .delete(`${basePath}/ando/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ keyword });

      // Then
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(matchers));
    });

    it('deletes the piece', async () => {
      // Given
      const pieces = array2Matchers([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0,
      ]);

      await Promise.all(pieces.map(m => new PieceModel(m).save()));

      const targetPiece = { x: 0, y: 0, userId: 1 };

      const matchers = array2Matchers([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        0, 0, 0, 0, 0, 0,
      ]);

      // When
      const { body } = await chai.request(app)
        .delete(`${basePath}/ando/piece`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(targetPiece);

      // Then
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));

      const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propFilter)));
      expect(pieceData).toHaveLength(matchers.length);
      expect(pieceData).toMatchObject(expect.arrayContaining(matchers));
    });
  });
});
