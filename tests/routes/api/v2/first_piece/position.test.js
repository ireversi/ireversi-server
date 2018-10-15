const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const BoardStore = require('../../../../../src/models/v2/BoardStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');

const basePath = '/api/v2/first_piece';
const waitTime = PieceStore.getWaitTime();
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

describe('piece', () => {
  // テスト：positionが置けるか。
  it('is stoodby in a board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '4:1', '5:2',
        '5:3', 0,
      ],
    );

    const matches = array2Standbys.array2Standbys(
      [
        '4:1', '5:2:f',
        '5:3:f', 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: piece.userId })
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

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '4:1', '5:2',
        '5:3', 0,
      ],
    );

    // When
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: p.userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: p.x,
          y: p.y,
        });

      const { standbys } = BoardStore.getBoard();
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

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '1:1', 0, '4:4',
        '3:3', '2:2', '5:5',
        ['6:6', '9:9'], '7:7', '8:8',
      ],
    );

    const matches = array2Standbys.array2Standbys(
      [
        '1:1:f', 0, '4:4:f',
        '3:3', '2:2:f', '5:5:f',
        ['6:6:f', '9:9:f'], '7:7', '8:8:f',
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: piece.userId })
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

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '4:1', 0,
        0, 0,
      ],
    );

    // When
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: p.userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: p.x,
          y: p.y,
        });

      const res = response.body; // 返り値を１つずつ

      // Then
      // waitTimeを待たずにStandbyを確認したら格納されている
      if (res.status) {
        const standbys = PieceStore.getStandbys();
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
        const standbys = PieceStore.getStandbys();
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j]; // board内のstandby情報
          expect(standby).toBe(undefined); // waitTimeが経過して、undefinedになっている
        }
      }
    }
  });
});
