const klawSync = require('klaw-sync'); // ファイルを読んでいく、一覧をつくる
const swaggerUi = require('swagger-ui-express'); // オープンAPIのルールを動かす
const swaggerJSDoc = require('swagger-jsdoc'); // モジュールに必要な設定

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    swagger: '2.0', 
    info: { // 基本設定
      title: 'iReversi API',
      version: '0.0.1',
      description: 'Document for iReversi API',
    },
    basePath: '/api/v1',
    consumes: ['application/x-www-form-urlencoded'], // ルールとか
    produces: ['application/json'],
  },
  apis: klawSync('./swagger', { nodir: true }).map(f => f.path), 
  // ymlファイルを全部登録する必要がある
  // mapで全部見てる
});

module.exports = {
  serve: swaggerUi.serve, // 結果を返す
  setup: swaggerUi.setup(swaggerSpec),
};
