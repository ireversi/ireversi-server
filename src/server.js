// 本番で開くファイル
const app = require('./routes/app.js');
const { connectDB } = require('./utils/db.js');
const { port } = require('./config.js'); // 環境変数
const { serve, setup } = require('./utils/swaggerUi.js'); // 連想配列の中身だけ取り出す

/* eslint-disable no-console */
(async () => {
  await connectDB(); // DBに接続

  const docsPath = '/api-docs/v1'; // ドキュメントのURL決める
  app.use(docsPath, serve, setup);
  app.listen(port, () => console.log(`Server is running on port ${port}`)); // ポート番号を表示させる
  console.log(`API docs path: ${docsPath}`); // 接続できるよ、ってのを書いている
})();
