const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Standbys = require('../../../../../src/utils/array2Standbys.js');
const app = require('../../../../../src/routes/app.js');

const waitTime = PieceStore.getWaitTime();

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

describe('position', () => {
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

  // userIdと方角を与えて、レーザービーム打てるかのテスト
  it('start remaining timer', async () => {
    await chai.request(app).delete(`${basePath}`);

    // Given
    // addPieceで直接piecesの前提条件を用意する
    const prepare = [
      { x: 0, y: 1, userId: 4 },
      { x: 1, y: 1, userId: 3 },
    ];
    for (let i = 0; i < prepare.length; i += 1) {
      PieceStore.addPiece(prepare[i]);
    }

    // position.jsに送って、Standbyのコマを作る
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, 0, 0,
        0, '2:1', 0,
      ],
    );

    // directionに投げるデータ
    const user = 2;
    const direction = 'n';
    const status = true;

    // 期待値
    const matches = array2Matchers(
      [
        0, 2, 0,
        4, 2, 0,
        1, 2, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    let standbyRes;

    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];

      // piecesのuserIdを送る。standby状態を作る。
      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: piece.userId })
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
          .query({ userId: user, direction })
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
  it('start remaining timer', async () => {
    await chai.request(app).delete(`${basePath}`);

    // Given
    // addPieceで直接piecesの前提条件を用意する
    const prepare = [
      { x: 0, y: 1, userId: 4 },
      { x: 1, y: 1, userId: 3 },
    ];
    for (let i = 0; i < prepare.length; i += 1) {
      PieceStore.addPiece(prepare[i]);
    }

    // position.jsに送って、Standbyのコマを作る
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, 0, 0,
        0, '2:1', 0,
      ],
    );

    // directionに投げるデータ
    const user = 2;
    const direction = 'e';
    const status = false;

    // 期待値
    const matches = array2Matchers(
      [
        0, 0, 0,
        4, 3, 0,
        1, 0, 0,
      ],
    );

    // When
    // 返り値として期待するmatchesと、返り値との比較テスト
    let positionRes;
    let standbyRes;

    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];

      // piecesのuserIdを送る。standby状態を作る。
      positionRes = await chai.request(app)
        .post(`${basePath}/position`)
        .query({ userId: piece.userId })
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
          .query({ userId: user, direction })
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
});
