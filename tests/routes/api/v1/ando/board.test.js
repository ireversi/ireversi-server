const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PieceModel = require('../../../../../src/models/ando/PieceModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');
// const array2Mathcers = require('');
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

const basePath = '/api/v1';

describe('board', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('get peces', () => {
    it('gets all', async () => {
      // Given
      const matchers = array2Matchers([
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 8,
        0, 4, 8, 2, 0, 0,
        0, 2, 0, 0, 3, 0,
        3, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0,
      ]);

      await Promise.all(matchers.map(m => new PieceModel(m).save()));

      // When
      const { body } = await chai.request(app).get(`${basePath}/ando/board`);

      // Then
      expect(body).toHaveLength(matchers.length);
      expect(body).toEqual(expect.arrayContaining(matchers));
    });
  });
});
