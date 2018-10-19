const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const BoardStore = require('../../../../../src/models/v2/BoardStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');

const waitTime = PieceStore.getWaitTime();
// const deletePieces = PieceStore.deletePieces();

const basePath = '/api/v2/first_piece';

describe('position', () => {
  // beforeAll(deletePieces);
  // afterEach(deletePieces);
  // 盤面に自コマがない（１手目である）
  // 返り値の形式
  // {
  //   userId: 1,
  //   direction: 'nw',
  // }
  //
  // standbyを置く
  // ・userIdを送って、自コマがstandbyに入っているかを判定するテスト
  // 方向を送る
  // ・向かう方向の先端にstandbyやpieceがあると方向を送れないテスト
  // ・
  // {
  //   "status": true,
  //   "piece": {
  //     "x": 1,
  //     "y": 1,
  //     "userId": 1
  //   },
  //   "direction": "nw"
  // }

  // 前提条件を揃えるテスト
  // positionに値を投げて、返り値のstandbyと期待値が合うか
  // positionと同様のテスト
  it('start remaining timer', async () => {
    await chai.request(app).delete(`${basePath}`);

    // Given
    // position.jsに送って、Standbyを作る
    const pieces = array2Pieces.array2Pieces(
      [
        '2:1', '2:2',
        0, 0,
      ],
    );

    // 期待値
    const matches = array2Standbys.array2Standbys(
      [
        '2:1', '2:2:f',
        0, 0,
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

  // userIdをgetBoardに投げて、自コマのstandbyがあるかを判定するテスト
  it('start remaining timer', async () => {
    await chai.request(app).delete(`${basePath}`);

    // Given
    // position.jsに送って、Standbyを作る
    const pieces = array2Pieces.array2Pieces(
      [
        '2:1', '2:2',
        0, 0,
      ],
    );

    const user = 2;

    // 期待値
    const matches = array2Standbys.array2Standbys(
      [
        '2:1', '2:2:f',
        0, 0,
      ],
    );
    console.log(matches);

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    // let standbyRes;
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      console.log(piece);

      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: piece.userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });
      console.log(positionRes.body);
      const board = BoardStore.getBoard();
      console.log(board);


      standbyRes = await chai.request(app)
        .post(`${basePath}/direction`)
        .query({ userId: user })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
        });
    }
  });
});
