const app = require('./routes/app.js');
const { connectDB } = require('./utils/db.js');
const { port, nodeEnv } = require('./config.js');

(async () => {
  await connectDB();
  if (nodeEnv === 'development') {
    const { serve, setup } = require('./utils/swaggerUi.js');
    const docsPath = '/api-docs/v1';
    app.use(docsPath, serve, setup);
    console.log(`API docs: http://localhost:${port}${docsPath}`);
  }
  app.listen(port, () => console.log(`Server is running on port ${port}`));
})();
