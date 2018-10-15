const klawSync = require('klaw-sync');
const swaggerJSDoc = require('swagger-jsdoc'); // jsのなかに書いて読んで行く機能

module.exports = ['v1', 'v2'].map(version => ({
  version,
  spec: (swaggerJSDoc({
    swaggerDefinition: {
      swagger: '2.0',
      info: {
        title: `iReversi API ${version}`, // swaggerにおけるタイトル
        version: '0.0.1',
        description: `Document for iReversi API ${version}`,
      },
      basePath: `/api/${version}`,
      consumes: ['application/x-www-form-urlencoded'], // ルールとか
      produces: ['application/json'],
    },
    apis: klawSync(`./swagger/${version}`, { nodir: true }).map(f => f.path),
    // ymlファイルを全部登録する必要がある
    // mapで全部見てる
  })),
  option: {
    explorer: true,
  },
}));
