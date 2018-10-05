const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const app = require('../../../../../src/routes/app.js');

const waitTime = PieceStore.getWaitTime();

const basePath = '/api/v2/first_piece/position';

describe('play', () => {
  // 盤面に自コマがない（１手目である）
  // 返り値の形式
  // [
  //   {
  //     "status": true, // 置けたかどうか
  //     "standby": {
  //       "remaining": 0,
  //       "piece": {
  //         "x": 1,
  //         "y": 1,
  //         "user_id": 1
  //       },
  //     },
  //   }
  // ]

  it('start remaining timer', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', '2:2',
        '3:3', 0,
      ],
    );

    const matches = PieceStore.array2Standby(
      [
        1, 2,
        3, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: piece.userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
          userId: piece.userId,
        });
    }

    // Then
    for (let i = 0; i < response.body.length; i += 1) {
      const res = response.body[i];
      const match = matches[i];
      console.log(res);

      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining;
      const remaining = waitTime - timeLog;

      expect(res.status).toEqual(match.status);
      expect(remaining).toBeLessThanOrEqual(match.standby.remaining);
      expect(res.standby.piece).toMatchObject(match.standby.piece);
    }
  });

  // すでにコマがある場合に置けない（piece/index.jsと同じロジック）
  it('start remaining timer', async () => {
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', ['2:2', '4:4'],
        '3:3', 0,
      ],
    );
    console.log(pieces);


    const matches = PieceStore.array2Standby(
      [
        1, 2,
        3, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: piece.userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
          x: piece.x,
          y: piece.y,
          userId: piece.userId,
        });
    }

    for (let i = 0; i < response.body.length; i += 1) {
      const res = response.body[i];
      const match = matches[i];
      const dateNow = Date.now(); // チェックする時刻
      const timeLog = dateNow - res.standby.remaining;
      const remaining = waitTime - timeLog;

      expect(res.status).toEqual(match.status);
      expect(remaining).toBeLessThanOrEqual(match.standby.remaining);
      expect(res.standby.piece).toMatchObject(match.standby.piece);
    }
  });

  // // 盤面に自コマがある場合にremainingが回らないテスト
  // it('start remaining timer', async () => {
  //   await chai.request(app).delete(`${basePath}`);

  //   // Given
  //   const pieces = PieceStore.array2Pieces(
  //     [
  //       '1:1', '2:2', 0,
  //       0, '3:3', 0,
  //       0, '2:4', 0,
  //     ],
  //   );

  //   const matches = PieceStore.array2Standby(
  //     [
  //       1, 2, 0,
  //       0, 2, 0,
  //       0, 2, 0,
  //     ],
  //   );

  //   // When
  //   let response;
  //   for (let i = 0; i < pieces.length; i += 1) {
  //     const piece = pieces[i];
  //     response = await chai.request(app)
  //       .post(`${basePath}`)
  //       .query({ userId: piece.userId })
  //       .set('content-type', 'application/x-www-form-urlencoded')
  //       .send({
  //         x: piece.x,
  //         y: piece.y,
  //         userId: piece.userId,
  //       });
  //   }

  //   // Then
  //   // expect(response.body).toHaveLength(matches.length);
  //   // expect(response.body).toEqual(expect.arrayContaining(matches));

  //   for (let i = 0; i < response.body.length; i += 1) {
  //     const res = response.body[i];
  //     const match = matches[i];
  //     const dateNow = Date.now(); // チェックする時刻
  //     const timeLog = dateNow - res.standby.remaining; //
  //     const remaining = waitTime - timeLog;

  //     expect(res.status).toEqual(match.status);
  //     expect(remaining).toBeLessThanOrEqual(match.standby.remaining);
  //     expect(res.standby.piece).toMatchObject(match.standby.piece);
  //   }
  // });
});

// 1つの値を送る
// response
// swagger:
// postで送ったらstatusとpiece(自分の結果だけ表示)
// direction: piece, directionだけ返す
