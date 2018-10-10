const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const app = require('../../../../../src/routes/app.js');

const waitTime = PieceStore.getWaitTime();

const basePath = '/api/v2/first_piece';

describe('piece', () => {
  // テスト①-A 1つのposition置いて、返り値との比較
  it('is stoodby in a board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '4:1', '5:2',
        '5:3', 0,
      ],
    );

    const matches = PieceStore.array2Standbys(
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
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining; // テストを投げた時刻とチェックする時刻との時間差
      const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間

      // Then
      expect(res.status).toEqual(match.status); // 置けたかの判定が合っているか
      expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
      expect(res.standby.piece).toMatchObject(match.standby.piece); // pieceの値が合っているか
    }
  });

  // テスト①-B 1つのposition置いて、Board内のStandbyに格納されているかの確認
  // 入っていないことを確認するテストも同時に行う。
  it('is confirmed to be in standbys of board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '4:1', '5:2',
        '5:3', 0,
      ],
    );

    // When
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

      const standbys = PieceStore.getStandbys();
      const res = response.body; // 返り値を１つずつ
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining; // テストを投げた時刻とチェックする時刻との時間差
      const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間

      // Then
      // 返り値のstatusがtrueのときはstandbysに入ってるか確認
      if (res.status === true) {
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j];
          const stbPiece = standby.piece;
          expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
          expect(res.standby.piece).toMatchObject(stbPiece); // pieceの値が合っているか
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

  // テスト②-A 返り値との比較
  // 他コマ（デフォルトコマ）の上には置けない。それ以外は置ける。
  it('is stoodby in a board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', 0, '4:4',
        '3:3', '2:2', '5:5',
        ['6:6', '9:9'], '7:7', '8:8',
      ],
    );

    const matches = PieceStore.array2Standbys(
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
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining; // テストを投げた時刻とチェックする時刻との時間差
      const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間

      // Then
      expect(res.status).toEqual(match.status); // 置けたかの判定が合っているか
      expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
      expect(res.standby.piece).toMatchObject(match.standby.piece); // pieceの値が合っているか
    }
  });

  // テスト②-B Board内のStandbysに格納されているかの確認
  // 送った値がBoard内のstandbysに入っているかのテスト
  // 他コマ（デフォルトコマ）の上には置けない。それ以外は置ける。
  it('is confirmed to be in standbys of board array', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '4:1', '5:2',
        '5:3', 0,
      ],
    );

    // When
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

      const standbys = PieceStore.getStandbys();
      const res = response.body; // 返り値を１つずつ
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining; // テストを投げた時刻とチェックする時刻との時間差
      const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間

      // Then
      // 返り値のstatusがtrueのときはstandbysに入ってるか確認
      if (res.status === true) {
        for (let j = 0; j < standbys.length; j += 1) {
          const standby = standbys[j];
          const stbPiece = standby.piece;
          expect(remaining).toBeLessThanOrEqual(waitTime); // 時間が経過して3000ミリ秒から時間が減っているか
          expect(res.standby.piece).toMatchObject(stbPiece); // pieceの値が合っているか
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

  // テスト③ remainingの待機時間が動作するかのテスト
  // expectを3000ミリ秒後に起動して、現在時刻との時差が3000ミリ秒以上あることを確認する
  it('remain 3000 ms after waiting 3000 ms', async () => {
    // Reset
    const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

    await chai.request(app).delete(`${basePath}`);
    jest.useRealTimers();

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        0, 0,
        0, '2:1',
      ],
    );

    // When

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
      await sleep(3000); // 3000ミリ秒待機
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining; // テストを投げた時刻とチェックする時刻との時間差
      const remaining = waitTime - timeLog; // 待機時間3000ミリ秒からの残り時間
      expect(remaining).toBeLessThanOrEqual(0); // 3000ミリ秒が経った結果、remainingが0よりも小さいか
    }
  });
});
