const chai = require('chai');
const propFilter = '-_id -__v';

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/kohski/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

describe('play', () => {
  beforeAll(prepareDB);   //全てのテストをやる前に1回だけ呼ばれる。
  afterEach(deleteAllDataFromDB);

  // ここからtaskで作成したテスト
  describe('put piece', () => {
    it('puts a piece', async () => {
      // Given
      const piece ={
        x:0,
        y:0,
        userID:1
      };
      
      // When
      const response = await chai.request(app)
        .post(`${basePath}/kohski/playing`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(piece);

      // Then
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject(piece);

      const pieces = await PlayingModel.find({});
      expect(pieces).toHaveLength(1);
      expect(pieces[0]).toMatchObject(piece);
    });
  });


  it('puts a piece', async () => {
    // Given
    const pieces =[
    {
      x:0,
      y:0,
      userID:1
    },
    {
      x:1,
      y:1,
      userID:2
    }
    ];
    
    // When
    let response;

    for(let i = 0; i<pieces.length; i++){
      response = await chai.request(app)
      .post(`${basePath}/kohski/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
    }

    // Then　expressからの配列
    //配列===長さ
    expect(response.body).toHaveLength(pieces.length);
    //配列===配列
    expect(response.body).toEqual(expect.arrayContaining(pieces));

    //
    const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({},propFilter)));
    expect(pieceData).toHaveLength(pieces.length);
    expect(pieceData).toEqual(expect.arrayContaining(pieces));
  });

  //同じところに置けないテスト
  it('cannot be put on same place', async () => {
    // Given
    const pieces =[
    {
      x:0,
      y:0,
      userID:1
    },
    {
      x:0,
      y:0,
      userID:2
    },
    {
      x:1,
      y:1,
      userID:3
    }
    ];
    
    const matchers = [
      {
        x:0,
        y:0,
        userID:1
      },
      {
        x:1,
        y:1,
        userID:3
      }
    ];


    // When
    let response;

    for(let i = 0; i<pieces.length; i++){
      response = await chai.request(app)
      .post(`${basePath}/kohski/playing`)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(pieces[i]);
    }

    // Then
    //左辺は現実、右辺は理想(=Matchers)
    //上はexpressの検証
    expect(response.body).toHaveLength(pieces.length-1);
    expect(response.body).toEqual(expect.arrayContaining(matchers));

    //mongodbの検証
    const pieceData = JSON.parse(JSON.stringify(await PlayingModel.find({},propFilter)));
    expect(pieceData).toHaveLength(pieces.length-1);
    expect(pieceData).toEqual(expect.arrayContaining(matchers));
  });

  //挟んだらめくれるテスト





  //はなれたところにおけないテスト
  //自分のがあったらめくれるところにしかおけない

});

