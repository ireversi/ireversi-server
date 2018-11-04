const chai = require('chai');
const jwt = require('jsonwebtoken');
const PieceStore = require('../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../src/utils/array2Pieces.js');
const array2Matchers = require('../../src/utils/array2Matchers.js');
const app = require('../../src/routes/app.js');
const storePlayHistory = require('../../src/utils/storePlayHistory');
const restoreMongo = require('../../src/utils/restoreMongo.js');
const sendMongo = require('../../src/utils/sendMongo.js');

const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../src/utils/db.js');

const generateToken = require('../../src/routes/api/v2/userIdGenerate/generateToken');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
const basePath = '/api/v2/piece/';

function genJwtArr(number) {
  const jwtIds = [];
  for (i = 0; i < number; i += 1) {
    const jwtElm = {};
    tempJwt = generateToken.generate();
    jwtElm.jwtId = tempJwt;
    jwtElm.decode = jwt.decode(tempJwt).userId;
    jwtIds.push(jwtElm);
  }
  return jwtIds;
}

function searchIndex(jwtIds, jwtId) {
  let ans = -1;
  jwtIds.forEach((elm, index) => {
    if (elm.decode === jwtId) {
      ans = index;
    }
  });
  return ans;
}

describe('piece', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  // MongoDBのデータを残して次のテストを行う
  describe('piece', () => {
    // デバッグ検証、candidates残り確認
    it('cannot be put on the same place3', async () => {
      // Reset
      await chai.request(app).delete(`${basePath}`);
      PieceStore.deletePieces();
      storePlayHistory.deleteStandbySendMongo();

      // Mongoに送信開始
      sendMongo.startSendingMongo();

      const jwtIds = genJwtArr(3);
      // Given
      const pieces = array2Pieces.array2Pieces(
        [
          0, 0, 0,
          `${jwtIds[0].decode}:1`, [`${jwtIds[1].decode}:2`, `${jwtIds[2].decode}:3`], `${jwtIds[0].decode}:4`,
          0, 0, 0,
        ],
      );

      // When
      // MongoDBに送るだけの処理
      for (let i = 0; i < pieces.length; i += 1) {
        const index = searchIndex(jwtIds, pieces[i].piece.userId);
        await chai.request(app)
          .post(`${basePath}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .set('Authorization', jwtIds[index].jwtId)
          .send(pieces[i].piece);
      }
      await sleep(2000); // 2000ミリ秒待機

      // DBに送るのを一旦停止
      await sendMongo.stopSendingMongo();

      /*
      ここからサーバ・DBに再接続して、期待値を与えテストする
        */

      // Reset
      await chai.request(app).delete(`${basePath}`);
      PieceStore.deletePieces(); // 配列を空に。
      storePlayHistory.deleteStandbySendMongo(); // Mongoに送る前の配列も空に。

      // MongoDBから値を取得して、judgePieceして、Piecesに入っていく
      await restoreMongo.restoreMongo();

      const resPieces = PieceStore.getPieces();
      resPieces.shift(); // x:0, y:0, userId:1 を削除

      // Piecesに復元した盤面と照合するための期待値(下部でmatchesDBに再度変換)
      // 復元するときにjudgePieceしているので、めくり終えたあとの盤面を再現
      const matches = array2Matchers.array2Matchers(
        [
          0, 0, 0,
          `${jwtIds[0].decode}:1`, `${jwtIds[0].decode}:2`, `${jwtIds[0].decode}:3`,
          0, 0, 0,
        ],
      );

      // MongoDB確認のため、matchesからstatus: falseのオブジェクトを抜いた配列
      const matchesDB = matches.filter(m => m.status === true);

      // When
      // 1ピースずつ確認
      for (let i = 0; i < matchesDB.length; i += 1) {
        // Then
        expect(resPieces).toContainEqual(expect.objectContaining(matchesDB[i].piece));
      }
      expect(resPieces).toHaveLength(matchesDB.length); // x: 0, y: 0のデフォルト値を考慮
    });
  });
});
