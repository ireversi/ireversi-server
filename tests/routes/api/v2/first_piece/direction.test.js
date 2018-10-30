const chai = require('chai');
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');
const BoardHistoryModel = require('../../../../../src/models/v2/BoardHistoryModel.js');

const { // テストのたびにDBをクリア
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const waitTime = PieceStore.getWaitTime();
const propFilter = '-_id -__v';
const basePath = '/api/v2/first_piece';

const array2Matchers = (field) => {
  const array = [];
  const sqrt = Math.sqrt(field.length);
  for (let i = 0; i < field.length; i += 1) {
    if (field[i] !== 0) {
      const x = i % sqrt;
      const y = Math.floor(((field.length - 1) - i) / sqrt);
      const userId = field[i];
      array.push({ x, y, userId });
    }
  }
  return array;
};

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

describe('direction', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  // 前提条件を揃えるテスト
  // positionに値を投げて、返り値のstandbyと期待値が合うか
  // positionと同様のテスト
  it('needed a standbied position', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(1);

    // Given
    // position.jsに送って、Standbyを作る
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[0].decode}:2`,
        0, 0,
      ],
    );

    // 期待値
    const matches = array2Standbys.array2Standbys(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[0].decode}:2:f`,
        0, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const { piece } = pieces[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);

      response = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });

      const res = response.body; // 返り値を１つずつ
      const match = matches[i]; // 期待値を１つずつ

      // Then
      expect(res.status).toEqual(match.status); // 置けたかの判定が合っているか
      expect(res.standby.remaining).toBeLessThanOrEqual(waitTime); // 時間が経過し、待機時間から時間が減っているか
      expect(res.standby.piece).toMatchObject(match.standby.piece); // pieceの値が合っているか
    }
  });

  // userIdと方角を与えて、レーザービーム打てるかのテスト
  it('let player shoot lazer beem', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(5);

    // // Given
    // addPieceで直接piecesの前提条件を用意する
    const prepare = [
      { x: 0, y: 1, userId: jwtIds[3].decode },
      { x: 1, y: 1, userId: jwtIds[2].decode },
    ];
    for (let i = 0; i < prepare.length; i += 1) {
      PieceStore.addPiece(prepare[i]);
    }

    // position.jsに送って、Standbyのコマを作る
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, 0, 0,
        0, `${jwtIds[1].decode}:1`, 0,
      ],
    );

    // directionに投げるデータ
    const user = jwtIds[1].decode;
    const direction = 'n';
    const status = true;

    // 期待値
    const matches = array2Matchers(
      [
        0, jwtIds[1].decode, 0,
        jwtIds[3].decode, jwtIds[1].decode, 0,
        1, jwtIds[1].decode, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    let standbyRes;

    for (let i = 0; i < pieces.length; i += 1) {
      const { piece } = pieces[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);

      // piecesのuserIdを送る。standby状態を作る。
      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });

      if (positionRes.body.status) {
        // 別途定義した確認したいuserIdとdirectionを送る。
        // 結果がpiecesに入っているかを確認する。

        standbyRes = await chai.request(app)
          .post(`${basePath}/direction`)
          .set('Authorization', jwtIds[index].jwtId)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            userId: user,
            direction,
          });
      }

      const piecesOnBoard = PieceStore.getPieces();
      const standbysOnBoard = PieceStore.getStandbys();

      // Then
      expect(standbyRes.body.status).toEqual(status); // 送った結果、置けたかどうか
      for (let j = 0; j < standbysOnBoard.length; j += 1) { // standbyが消えているか
        const stb = standbysOnBoard[j];
        expect(stb.piece).not.toMatchObject(piece);
      }
      expect(piecesOnBoard).toHaveLength(matches.length); // pieceの数が合っているか
      expect(piecesOnBoard).toEqual(expect.arrayContaining(matches)); // piecesの中身が合っているか
    }
  });

  // userIdと方角を与えるが、レーザービーム打てないテスト
  it('start remaining timer3', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(5);

    // Given
    // addPieceで直接piecesの前提条件を用意する
    const prepare = [
      { x: 0, y: 1, userId: jwtIds[3].decode },
      { x: 1, y: 1, userId: jwtIds[2].decode },
    ];
    for (let i = 0; i < prepare.length; i += 1) {
      PieceStore.addPiece(prepare[i]);
    }

    // position.jsに送って、Standbyのコマを作る
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, 0, 0,
        0, `${jwtIds[1].decode}:1`, 0,
      ],
    );

    // directionに投げるデータ
    const user = jwtIds[1].decode;
    const direction = 'e';
    const status = false;

    // 期待値
    const matches = array2Matchers(
      [
        0, 0, 0,
        jwtIds[3].decode, jwtIds[2].decode, 0,
        1, 0, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    let standbyRes;

    for (let i = 0; i < pieces.length; i += 1) {
      const { piece } = pieces[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);

      // piecesのuserIdを送る。standby状態を作る。
      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });

      if (positionRes.body.status) {
        // 別途定義した確認したいuserIdとdirectionを送る。
        // 結果がpiecesに入っているかを確認する。
        standbyRes = await chai.request(app)
          .post(`${basePath}/direction`)
          .set('Authorization', jwtIds[index].jwtId)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            userId: user,
            direction,
          });
      }

      const piecesOnBoard = PieceStore.getPieces();
      const standbysOnBoard = PieceStore.getStandbys();

      // Then
      expect(standbyRes.body.status).toEqual(status); // 送った結果、置けたかどうか
      for (let j = 0; j < standbysOnBoard.length; j += 1) { // standbyが消えているか
        const stb = standbysOnBoard[j];
        expect(stb.piece).not.toMatchObject(piece);
      }
      expect(piecesOnBoard).toHaveLength(matches.length); // pieceの数が合っているか
      expect(piecesOnBoard).toEqual(expect.arrayContaining(matches)); // piecesの中身が合っているか
    }
  });

  // MongoDBに保存されているかのテスト
  it('can be saved in MongoDB', async () => {
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(5);

    // // Given
    // addPieceで直接piecesの前提条件を用意する
    const prepare = [
      { x: 0, y: 1, userId: jwtIds[3].decode },
      { x: 1, y: 1, userId: jwtIds[2].decode },
    ];
    for (let i = 0; i < prepare.length; i += 1) {
      PieceStore.addPiece(prepare[i]);
    }

    // position.jsに送って、Standbyのコマを作る
    // すべておける前提
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, 0, 0,
        0, `${jwtIds[1].decode}:1`, 0,
      ],
    );

    // directionに投げるデータ
    const user = jwtIds[1].decode;
    const direction = 'n';
    const status = true;

    // 期待値
    const matches = array2Matchers(
      [
        0, jwtIds[1].decode, 0,
        jwtIds[3].decode, jwtIds[1].decode, 0,
        1, jwtIds[1].decode, 0,
      ],
    );

    // 向かう方角のpieceを定義
    const matchesDB = array2Matchers(
      [
        0, 0, 0,
        0, jwtIds[1].decode, 0,
        0, 0, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    let standbyRes;

    for (let i = 0; i < pieces.length; i += 1) {
      const { piece } = pieces[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);

      // piecesのuserIdを送る。standby状態を作る。
      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });

      if (positionRes.body.status) {
        // 別途定義した確認したいuserIdとdirectionを送る。
        // 結果がpiecesに入っているかを確認する。

        standbyRes = await chai.request(app)
          .post(`${basePath}/direction`)
          .set('Authorization', jwtIds[index].jwtId)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            userId: user,
            direction,
          });
      }

      const piecesOnBoard = PieceStore.getPieces();
      const standbysOnBoard = PieceStore.getStandbys();

      // Then
      expect(standbyRes.body.status).toEqual(status); // 送った結果、置けたかどうか
      for (let j = 0; j < standbysOnBoard.length; j += 1) { // standbyが消えているか
        const stb = standbysOnBoard[j];
        expect(stb.piece).not.toMatchObject(piece);
      }
      expect(piecesOnBoard).toHaveLength(matches.length); // pieceの数が合っているか
      expect(piecesOnBoard).toEqual(expect.arrayContaining(matches)); // piecesの中身が合っているか

      // MongoDBに置けてるかどうかの確認
      // Mongoからデータを取得
      const directionData = JSON.parse(
        JSON.stringify(
          await BoardHistoryModel.find({}, propFilter),
        ),
      );
      for (let j = 0; j < directionData.length; j += 1) {
        if (directionData[j].path === 'first_piece/direction') { // Mongoからdirectionだけを検索
          const dirEl = directionData[j].piece; // directionで向かう方角のpieceを取得
          for (let k = 0; k < matchesDB.length; k += 1) {
            const matchEl = matchesDB[k];
            expect(dirEl).toEqual(matchEl);
          }
        }
      }
    }
  });
});
