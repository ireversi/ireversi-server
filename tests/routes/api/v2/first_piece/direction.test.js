const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');

const waitTime = PieceStore.getWaitTime();
// const deletePieces = PieceStore.deletePieces();

const basePath = '/api/v2/first_piece/direction';

describe('position', () => {
  // beforeAll(deletePieces);
  // afterEach(deletePieces);
  describe('play', () => {
    // 盤面に自コマがない（１手目である）
    // 返り値の形式
    // {
    //   userId: 1,
    //   direction: 'nw',
    // }

    it('start remaining timer', async () => {
      // Reset
      await chai.request(app).delete(`${basePath}`);

      // Given
      const pieces = array2Pieces.array2Pieces(
        [
          '1:1', '2:2',
          '3:3', 0,
        ],
      );

      const matches = array2Standbys.array2Standbys(
        [
          '1:1', '2:2',
          '3:3', 0,
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
      const pieces = array2Pieces.array2Pieces(
        [
          '1:1', ['2:2', '4:4'],
          '3:3', 0,
        ],
      );

      const matches = array2Standbys.array2Standbys(
        [
          '1:1', ['2:2', '4:4'],
          '3:3', 0,
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

    // 盤面に自コマがある場合にremainingが回らないテスト
    it('start remaining timer', async () => {
      await chai.request(app).delete(`${basePath}`);

      // Given
      // 作っておく盤面
      const pieces = array2Pieces.array2Pieces(
        [
          '1:1', '2:2', 0,
          0, 0, 0,
          0, 0, 0,
        ],
      );

      const matches = array2Standbys.array2Standbys(
        [
          '1:1', '2:2', 0,
          0, 0, 0,
          0, 0, 0,
        ],
      );
      // {
      //   "status": true,
      //   "piece": {
      //     "x": 1,
      //     "y": 1,
      //     "userId": 1
      //   },
      //   "direction": "nw"
      // }

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
          });
      }

      // Then
      // expect(response.body).toHaveLength(matches.length);
      // expect(response.body).toEqual(expect.arrayContaining(matches));

      for (let i = 0; i < response.body.length; i += 1) {
        const res = response.body[i];
        const match = matches[i];
        const dateNow = Date.now(); // チェックする時刻
        const timeLog = dateNow - res.standby.remaining; //
        const remaining = waitTime - timeLog;

        expect(res.status).toEqual(match.status);
        expect(remaining).toBeLessThanOrEqual(match.standby.remaining);
        expect(res.standby.piece).toMatchObject(match.standby.piece);
      }
    });
  });
});
