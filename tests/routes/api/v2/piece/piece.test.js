const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const app = require('../../../../../src/routes/app.js');

const basePath = '/api/v2/piece/';

describe('piece', () => {
  // デバッグ検証
  // 盤面に自コマがあるときは、他コマがめくれるところだけおける
  it('cannot be put unless it can flip another piece', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        0, '2:2', 0,
        0, '1:1', '1:3',
        0, 0, 0,
      ],
    );

    // 置けないコマは'1:3:f'と、最後にfを付ける
    const matches = PieceStore.array2Matchers(
      [
        0, '2:2', 0,
        0, '1:1', '1:3:f',
        0, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];

      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);

      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // デバッグ検証、同じところに置けないテスト
  it('cannot be put on the same place', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        0, ['2:2', '2:4', '1:5'], 0,
        0, ['1:1', '1:3'], 0,
        0, 0, 0,
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        0, ['2:2', '2:4:f', '1:5:f'], 0,
        0, ['1:1', '1:3:f'], 0,
        0, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];

      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);

      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // 一つ駒を置く
  it('is put', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', 0,
        0, 0,
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        '1:1', 0,
        0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);

      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // 離れたところは置けない1
  it('never become alone (far away from the other pieces)', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', 0, 0,
        0, 0, '2:4',
        0, '2:3', '2:2',
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        '1:1', 0, 0,
        0, 0, '2:4:f',
        0, '2:3:f', '2:2:f',
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // 離れたところは置けない2
  it('never become alone (far away from the other pieces)', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', 0, '2:2',
        0, 0, 0,
        0, 0, 0,
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        '1:1', 0, '2:2:f',
        0, 0, 0,
        '2:3:f', 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);

      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // １手目の場合、斜めに置けないテスト
  it('can be put on cell next to the other pieces not on diagle cells', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '2:3', 0, ['2:2', '2:6'],
        0, '1:1', 0,
        '2:4', 0, '2:5',
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        '2:3:f', 0, ['2:2:f', '2:6:f'],
        0, '1:1', 0,
        '2:4:f', 0, '2:5:f',
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);

      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });

  // 盤面に自コマがない場合、他コマの上下左右だけおける。斜めには置けないテスト。
  it('can be put on a cell next to the other pieces', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', '2:4', 0,
        0, ['3:3', '3:5'], 0,
        0, 0, '2:2',
      ],
    );

    const matches = PieceStore.array2Matchers(
      [
        '1:1', '2:4', 0,
        0, ['3:3:f', '3:5'], 0,
        0, 0, '2:2:f',
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      response = await chai.request(app)
        .post(`${basePath}`)
        .query({ userId: pieces[i].userId })
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
      // Then
      expect(response.body).toEqual(match);
      expect(response.body).toEqual(expect.objectContaining({
        status: match.status,
        piece: {
          x: match.piece.x,
          y: match.piece.y,
          userId: match.piece.userId,
        },
      }));
    }
  });
});
