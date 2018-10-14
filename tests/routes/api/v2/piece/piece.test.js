const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Matchers = require('../../../../../src/utils/array2Matchers.js');
const app = require('../../../../../src/routes/app.js');

const basePath = '/api/v2/piece/';

describe('piece', () => {
  // piecesで何も渡さないが、返り値には初期値が入っているのを確認するテスト
  it('exist on 0:0 as default', async () => {
    // Reset
    /* -----------------------*/
    /* Reset後は
     { x: 0, y: 0, userId: 1 }
     がデフォルトで入ります
     */
    /* -----------------------*/
    await chai.request(app).delete(`${basePath}`);

    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        0, 0, 0,
        ['1:1'], 0, 0,
      ],
    );

    // When
    const response = PieceStore.getPieces();

    // Then
    expect(response[0]).toEqual(matches[0].piece);
  });

  // 初期値がある上で、同じマスに置けないテスト
  it('cannot be put on the same place', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    // デフォルトで { x: 0, y: 0, userId: 1 } があります
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0,
        ['2:1'], 0,
      ],
    );

    // 置けないコマは'1:3:f'と、最後にfを付ける
    const matches = array2Matchers.array2Matchers(
      [
        0, 0,
        ['2:1:f'], 0,
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
    // デフォルトで { x: 0, y: 0, userId: 1 } があります
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, ['3:2', '5:3'], 0,
        0, ['2:1'], 0,
      ],
    );

    // 置けないコマは'1:3:f'と、最後にfを付ける
    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        0, ['3:2', '5:3:f'], 0,
        0, ['2:1'], 0,
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

  // デバッグ検証、candidates残り確認
  it('cannot be put on the same place', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        '3:1', ['4:2', '2:3'], '3:4',
        0, 0, 0,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        '3:1', ['4:2', '2:3:f'], '3:4',
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

  // 初期値があるから1を他の場所に置けない、離れたところに置けないテスト
  it('is put', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '1:1', '2:2',
        0, '1:3',
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        '1:1:f', '2:2:f',
        0, '1:3:f',
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
    const pieces = array2Pieces.array2Pieces(
      [
        '1:1', 0, 0,
        0, 0, '2:4',
        0, '2:3', '2:2',
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        '1:1:f', 0, 0,
        0, 0, '2:4:f',
        0, '2:3', '2:2:f',
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
    const pieces = array2Pieces.array2Pieces(
      [
        '1:1', 0, '2:2',
        0, 0, 0,
        0, 0, '2:3',
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        '1:1:f', 0, '2:2:f',
        0, 0, 0,
        0, 0, '2:3:f',
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

  // 盤面で１手目の場合、斜めに置けないテスト
  it('can be put on cell next to the other pieces not on diagle cells', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        '2:5', 0, ['2:4', '7:7'],
        '4:3', '5:2', 0,
        0, '3:1', '2:6',
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        '2:5', 0, ['2:4:f', '7:7:f'],
        '4:3', '5:2', 0,
        0, '3:1', '2:6',
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
    const pieces = array2Pieces.array2Pieces(
      [
        '1:1', '2:4', 0,
        0, ['3:3', '3:5'], 0,
        0, 0, '2:2',
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        '1:1:f', '2:4:f', 0,
        0, ['3:3:f', '3:5:f'], 0,
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

  it('can flip with defalut piece', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, '1:5',
        0, '3:2', '4:3',
        0, '2:1', 0,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        0, 0, '1:5',
        0, '3:2', '4:3',
        0, '2:1', 0,
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
