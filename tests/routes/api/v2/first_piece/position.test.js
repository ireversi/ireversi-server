const chai = require('chai');
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const BoardStore = require('../../../../../src/models/v2/BoardStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');
const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');
const BoardHistoryModel = require('../../../../../src/models/v2/BoardHistoryModel.js');

const { // テストのたびにDBをクリア
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v2/first_piece';
const propFilter = '-_id -__v';
const waitTime = PieceStore.getWaitTime();

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

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

  // テスト：positionが置けるか。
  it('is stoodby in a board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    PieceStore.deleteStandbys();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2`,
        `${jwtIds[1].decode}:3`, 0,
      ],
    );

    const matches = array2Standbys.array2Standbys(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2:f`,
        `${jwtIds[1].decode}:3:f`, 0,
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

  // テスト：置いたpositionが、Board内のStandbyに格納されているかの確認
  // 入っていたら、createdの情報からgetRemainingを再度叩いてremainingを確認する
  // 置けないコマの場合、Boardに入っていないことを確認するテストも同時に行う。
  it('is confirmed to be in standbys of board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    PieceStore.deleteStandbys();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2`,
        `${jwtIds[0].decode}:3`, 0,
      ],
    );

    // When
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i].piece;
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: p.x,
          y: p.y,
        });

      const { standbys } = BoardStore.getBoard(pieces[i].piece.userId);
      const res = response.body; // 返り値を１つずつ

      // Then
      // 返り値のstatusがtrueのときはstandbysに入ってるか確認
      if (res.status) {
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j]; // board内のstandby情報
          const { piece, remaining } = standby; // standbyのpieceとremainingの情報
          expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して待機時間から時間が減っているか
          expect(res.standby.piece).toMatchObject(piece); // pieceの値が合っているか
        }
      } else { // falseのときは、stanbdysに入っていないことを確認
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j];
          const stbPiece = standby.piece;
          expect(res.standby.piece).not.toMatchObject(stbPiece); // notして、入っていないことを確認
        }
      }
    }
  });

  // テスト：他コマ（デフォルトコマ）の上には置けない。それ以外は置ける。
  it('is stoodby in a board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    PieceStore.deleteStandbys();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(9);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, 0, `${jwtIds[3].decode}:4`,
        `${jwtIds[2].decode}:3`, `${jwtIds[1].decode}:2`, `${jwtIds[4].decode}:5`,
        [`${jwtIds[5].decode}:6`, `${jwtIds[8].decode}:9`], `${jwtIds[6].decode}:7`, `${jwtIds[7].decode}:8`,
      ],
    );

    const matches = array2Standbys.array2Standbys(
      [
        `${jwtIds[0].decode}:1:f`, 0, `${jwtIds[3].decode}:4:f`,
        `${jwtIds[2].decode}:3`, `${jwtIds[1].decode}:2:f`, `${jwtIds[4].decode}:5:f`,
        [`${jwtIds[5].decode}:6:f`, `${jwtIds[8].decode}:9:f`], `${jwtIds[6].decode}:7`, `${jwtIds[7].decode}:8:f`,
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
      expect(res.standby.remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
      expect(res.standby.piece).toMatchObject(match.standby.piece); // pieceの値が合っているか
    }
  });

  // テスト：waitTimeを過ぎると、Board内のStandbysが消えているかのテスト
  // 送った値がBoard内のstandbysに入っているか、waitTimeで待機したあとに消えているかで比較
  it('is confirmed to be in standbys of board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    PieceStore.deleteStandbys();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(1);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, 0,
        0, 0,
      ],
    );

    // When
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i].piece;

      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: p.x,
          y: p.y,
        });

      const res = response.body; // 返り値を１つずつ

      // Then
      // waitTimeを待たずにStandbyを確認したら格納されている
      const standbys = PieceStore.getStandbys();
      if (res.status) {
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j]; // board内のstandby情報
          const { piece, remaining } = standby;
          expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
          expect(res.standby.piece).toMatchObject(piece); // pieceの値が合っているか
        }
      } else { // falseのときは、stanbdysに入っていないことを念のために確認
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j];
          const { piece } = standby;
          expect(res.standby.piece).not.toMatchObject(piece); // notして、入っていないことを確認
        }
      }
      // Then
      // waitTimeが経ったあとにstandbyが空になっているかの確認
      if (res.status) {
        await sleep(waitTime); // 3500ミリ秒待機
        standbysConfirm = PieceStore.getStandbys();
        expect(standbysConfirm).toHaveLength(0); // waitTimeが経過して、配列が空になっている
      }
    }
  });

  it('is saved in MongoDB', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    PieceStore.deleteStandbys();

    // userIdのtokenを生成
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2`,
        `${jwtIds[1].decode}:3`, 0,
      ],
    );

    const matches = array2Standbys.array2Standbys(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2:f`,
        `${jwtIds[1].decode}:3:f`, 0,
      ],
    );

    // MongoDB確認のため、matchesからstatus: falseのオブジェクトを抜いた配列
    const matchesDB = matches.filter(m => m.status === true);

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
    const positionData = JSON.parse(JSON.stringify(await BoardHistoryModel.find({}, propFilter)));
    expect(positionData).toHaveLength(matchesDB.length);
  });
});
