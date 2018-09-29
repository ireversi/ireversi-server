const chai = require('chai');
const PieceModel = require('../../../../../src/models/v2/PieceModel.js');
const app = require('../../../../../src/routes/app.js');

const basePath = '/api/v2/piece/';

describe('play', () => {
  // 一つ駒を置く
  it('put a piece', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:1', 0,
        0, 0,
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        1, 0,
        0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
    // check mongoDB result
    // const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    // expect(pieceData).toHaveLength(rpieces.length);
    // expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });

  // 複数駒を置く
  it('sets multi pieces', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        0, 0,
        '1:1', '2:2',
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 0,
        1, 2,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 同じところにおけないテスト
  it('sets pieces same space', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        0, 0,
        '1:1', ['2:2', '1:3'],
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 0,
        1, 2,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 挟んだらめくれるテスト（左方向、上方向） part1
  it('turn over piece about left and up', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:5', 0, 0,
        '2:4', 0, 0,
        '1:1', '2:2', '1:3',
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        1, 0, 0,
        1, 0, 0,
        1, 1, 1,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 挟んだらめくれるテスト part2（右方向、下方向）
  it('turn over piece about right and down', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:3', '2:2', '1:1',
        0, 0, '2:4',
        0, 0, '1:5',
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        1, 1, 1,
        0, 0, 1,
        0, 0, 1,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 挟んだらめくれるテスト part3
  it('turn over piece about upper left and lower left', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        0, 0, 0, '1:6',
        '1:1', '2:2', '3:5', 0,
        0, '3:3', 0, 0,
        0, 0, '1:4', 0,
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 0, 0, 1,
        1, 2, 1, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 挟んだらめくれるテスト part4
  it('turn over piece about upper right and lower right', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:6', 0, 0, 0,
        0, '3:5', '2:2', '1:1',
        0, 0, '3:3', 0,
        0, '1:4', 0, 0,
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        1, 0, 0, 0,
        0, 1, 2, 1,
        0, 0, 1, 0,
        0, 1, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 場に一枚も置いてない場合の駒置きテスト（反転無し） part1
  it('in the case about nothing own piece, not turn over', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        0, 0, '4:5', 0,
        0, '3:3', 0, 0,
        0, '1:1', '1:4', 0,
        0, '2:2', 0, 0,
      ],
    );


    const matches = PieceModel.array2Matchers(
      [
        0, 0, 0, 0,
        0, 3, 0, 0,
        0, 1, 0, 0,
        0, 2, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 場に一枚も置いてない場合の駒置きテスト（反転有り） part2
  it('the case about nothing own piece, to turn over', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    // Given
    const pieces = PieceModel.array2Pieces(
      [
        0, '1:4', '3:6', 0,
        0, '3:3', 0, 0,
        0, '1:1', '2:5', 0,
        0, '2:2', 0, 0,
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 1, 3, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 2, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 場に駒がある場合の駒置きテスト（上下左右チェック） part1
  it('the case about exist own piece, check to turn over four direction', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:15', '1:14', '1:13', '1:12', '1:11',
        '1:16', 0, '4:4', 0, '1:10',
        '1:18', '5:17', '1:1', '3:3', '1:9',
        '1:19', 0, '2:2', 0, '1:8',
        '1:20', '1:21', '1:5', '1:6', '1:7',
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
        1, 1, 1, 1, 1,
        0, 0, 1, 0, 0,
        0, 0, 1, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // 場に駒がある場合の駒置きテスト（斜めの4方向チェック） part2
  it('the case about exist own piece, check to turn over four direction', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceModel.array2Pieces(
      [
        '1:15', 0, 0, 0, '1:14',
        '1:16', '8:8', '4:4', '7:7', '1:13',
        '1:17', '5:5', '1:1', '3:3', '1:12',
        0, '9:9', '2:2', '6:6', '1:11',
        '1:18', 0, 0, 0, '1:10',
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        1, 0, 0, 0, 1,
        0, 1, 4, 1, 0,
        1, 1, 1, 1, 1,
        0, 1, 2, 1, 0,
        1, 0, 0, 0, 1,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });

  // マスが空いて飛び石になっている場合に置けないテスト
  it('the test piece cannnot skip the blank cell to flip ', async () => {
    await chai.request(app).delete(`${basePath}`);

    const pieces = PieceModel.array2Pieces(
      [
        0, '1:7', 0, 0, 0,
        0, '6:6', '5:5', 0, 0,
        0, 0, '4:4', 0, 0,
        0, '2:2', '3:3', 0, 0,
        0, '1:1', 0, 0, 0,
      ],
    );

    const matches = PieceModel.array2Matchers(
      [
        0, 0, 0, 0, 0,
        0, 6, 5, 0, 0,
        0, 0, 4, 0, 0,
        0, 2, 3, 0, 0,
        0, 1, 0, 0, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }

    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
  });
});
