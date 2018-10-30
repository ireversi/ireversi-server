const chai = require('chai');
const jwt = require('jsonwebtoken');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const array2Pieces = require('../../../../../src/utils/array2Pieces.js');
const array2Matchers = require('../../../../../src/utils/array2Matchers.js');
const app = require('../../../../../src/routes/app.js');
const BoardHistoryModel = require('../../../../../src/models/v2/BoardHistoryModel.js');

const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const generateToken = require('../../../../../src/routes/api/v2/userIdGenerate/generateToken');

const basePath = '/api/v2/piece/';
const propFilter = '-_id -__v';

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

  // piecesで何も渡さないが、返り値には初期値が入っているのを確認するテスト
  it('exist on 0:0 as default', async () => {
    // Reset
    /* -----------------------*/
    /*
      Reset後は
      { x: 0, y: 0, userId: 1 }
      がデフォルトで入ります
     */
    /* -----------------------*/
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        0, 0, 0,
        ['1:1'], 0, 0,
      ],
    );

    // When
    PieceStore.initPieces();
    const response = PieceStore.getPieces();

    // Then
    expect(response[0]).toEqual(matches[0].piece);
  });

  // 初期値がある上で、同じマスに置けないテスト
  it('cannot be put on the same place1', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();

    // Given

    // userIdのtokenを生成
    const jwtIds = genJwtArr(1);

    // デフォルトで { x: 0, y: 0, userId: 1 } があります
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0,
        [`${jwtIds[0].decode}:1`], 0,
      ],
    );
    // 置けないコマは'1:3:f'と、最後にfを付ける
    const matches = array2Matchers.array2Matchers(
      [
        0, 0,
        [`${jwtIds[0].decode}:1:f`], 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        // .query({ userId: pieces[i].userId })
        .set('Authorization', jwtIds[index].jwtId)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i].piece);

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
  it('cannot be put on the same place2', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(3);

    // Given
    // デフォルトで { x: 0, y: 0, userId: 1 } があります
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        0, [`${jwtIds[0].decode}:2`, `${jwtIds[1].decode}:3`], 0,
        0, [`${jwtIds[2].decode}:1`], 0,
      ],
    );

    // 置けないコマは'1:3:f'と、最後にfを付ける
    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        0, [`${jwtIds[0].decode}:2`, `${jwtIds[1].decode}:3:f`], 0,
        0, [`${jwtIds[2].decode}:1`], 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
  it('cannot be put on the same place3', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(3);
    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, 0,
        `${jwtIds[0].decode}:1`, [`${jwtIds[1].decode}:2`, `${jwtIds[2].decode}:3`], `${jwtIds[0].decode}:4`,
        0, 0, 0,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        0, 0, 0,
        `${jwtIds[0].decode}:1`, [`${jwtIds[1].decode}:2`, `${jwtIds[2].decode}:3:f`], `${jwtIds[0].decode}:4`,
        0, 0, 0,
      ],
    );

    // MongoDB確認のため、matchesからstatus: falseのオブジェクトを抜いた配列
    const matchesDB = matches.filter(m => m.status === true);

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
    const pieceData = JSON.parse(JSON.stringify(await BoardHistoryModel.find({}, propFilter)));
    expect(pieceData).toHaveLength(matchesDB.length);

    // matchesから
    for (let i = 0; i < pieceData.length; i += 1) {
      const pc = pieceData[i];
      expect(pc.piece).toEqual(expect.objectContaining(matchesDB[i].piece));
    }
  });

  // 初期値があるから1を他の場所に置けない、離れたところに置けないテスト
  it('is put', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2`,
        0, `${jwtIds[0].decode}:3`,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:2`,
        0, `${jwtIds[0].decode}:3:f`,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, 0, 0,
        0, 0, `${jwtIds[1].decode}:4`,
        0, `${jwtIds[1].decode}:3`, `${jwtIds[1].decode}:2`,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        `${jwtIds[0].decode}:1:f`, 0, 0,
        0, 0, `${jwtIds[1].decode}:4:f`,
        0, `${jwtIds[1].decode}:3`, `${jwtIds[1].decode}:2:f`,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);
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
  it('never become alone (far away from the other pieces)2', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(2);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, 0, `${jwtIds[1].decode}:2`,
        0, 0, 0,
        0, 0, `${jwtIds[1].decode}:3`,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        `${jwtIds[0].decode}:1:f`, 0, `${jwtIds[1].decode}:2:f`,
        0, 0, 0,
        0, 0, `${jwtIds[1].decode}:3:f`,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(5);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:5`, 0, [`${jwtIds[0].decode}:4`, `${jwtIds[4].decode}:7`],
        `${jwtIds[2].decode}:3`, `${jwtIds[3].decode}:2`, 0,
        0, `${jwtIds[1].decode}:1`, `${jwtIds[0].decode}:6`,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        `${jwtIds[0].decode}:5`, 0, [`${jwtIds[0].decode}:4:f`, `${jwtIds[4].decode}:7:f`],
        `${jwtIds[2].decode}:3`, `${jwtIds[3].decode}:2`, 0,
        0, `${jwtIds[1].decode}:1`, `${jwtIds[0].decode}:6`,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(3);


    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        `${jwtIds[0].decode}:1`, `${jwtIds[1].decode}:4`, 0,
        0, [`${jwtIds[2].decode}:3`, `${jwtIds[2].decode}:5`], 0,
        0, 0, `${jwtIds[1].decode}:2`,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        `${jwtIds[0].decode}:1:f`, `${jwtIds[1].decode}:4:f`, 0,
        0, [`${jwtIds[2].decode}:3:f`, `${jwtIds[2].decode}:5:f`], 0,
        0, 0, `${jwtIds[1].decode}:2:f`,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);
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
    PieceStore.deletePieces();
    const jwtIds = genJwtArr(4);

    // Given
    const pieces = array2Pieces.array2Pieces(
      [
        0, 0, `${jwtIds[0].decode}:5`,
        0, `${jwtIds[2].decode}:2`, `${jwtIds[3].decode}:3`,
        0, `${jwtIds[1].decode}:1`, 0,
      ],
    );

    const matches = array2Matchers.array2Matchers(
      [
        0, 0, `${jwtIds[0].decode}:5`,
        0, `${jwtIds[2].decode}:2`, `${jwtIds[3].decode}:3`,
        0, `${jwtIds[1].decode}:1`, 0,
      ],
    );

    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      const match = matches[i];
      const index = searchIndex(jwtIds, pieces[i].piece.userId);
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', jwtIds[index].jwtId)
        .send(pieces[i].piece);

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
