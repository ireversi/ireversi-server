const chai = require('chai');
const PieceStore = require('../../../../../src/models/v2/PieceStore.js');
const app = require('../../../../../src/routes/app.js');

const basePath = '/api/v2/first_piece/position';

describe('play', () => {
  // 盤面に自コマがない（１手目である）
  // remaining 3500ミリ秒
  // 返り値
  // {
  //   "status": true, // 置けたかどうか
  //   "standby": {
  //     "remaining": 0,
  //     "piece": {
  //       "x": 1,
  //       "y": 1,
  //       "user_id": 1
  //     }
  //   }
  // }

  function array2Standby(array) {
    const standbys = [];
    const matchArray = PieceStore.array2Matchers(array);
    for (let i = 0; i < matchArray.length; i += 1) {
      const match = matchArray[i];
      const standby = {
        remaining: 0,
        piece: match,
      };
      standbys.push(standby);
    }
    return standbys;
  }

  it('start remaining timer', async () => {
    // Reset
    await chai.request(app).delete(`${basePath}`);

    // Given
    const pieces = PieceStore.array2Pieces(
      [
        '1:1', '2:2',
        0, 0,
      ],
    );

    const matches = array2Standby(
      [
        1, 2,
        0, 0,
      ],
    );
    console.log(matches);


    // When
    let response;
    for (let i = 0; i < pieces.length; i += 1) {
      response = await chai.request(app)
        .post(`${basePath}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(pieces[i]);
    }
    console.log(response.body);


    // Then
    expect(response.body).toHaveLength(matches.length);
    expect(response.body).toEqual(expect.arrayContaining(matches));
    // check mongoDB result
    // const pieceData = JSON.parse(JSON.stringify(await PieceModel.find({}, propfilter)));
    // expect(pieceData).toHaveLength(rpieces.length);
    // expect(pieceData).toEqual(expect.arrayContaining(rpieces));
  });
});

// 1つの値を送る
// response
// swagger:
// postで送ったらstatusとpiece(自分の結果だけ表示)
// direction: piece, directionだけ返す
