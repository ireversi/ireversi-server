const klawSync = require('klaw-sync');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc'); // jsのなかに書いて読んで行く機能

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    swagger: '2.0',
    info: {
      title: 'iReversi API', // swaggerにおけるタイトル
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
