const app = require('./routes/app.js');
const { connectDB } = require('./utils/db.js');
const { port, nodeEnv, origin } = require('./config.js');

(async () => {
  await connectDB();
  if (nodeEnv !== 'test') {
    // eslint-disable-next-line global-require
    const { serve, setup } = require('./utils/swaggerUi.js');
    const docsPath = '/api-docs/v1';
    app.use(docsPath, serve, setup);
    console.log(`API docs: ${origin}${docsPath}`);
  }
  app.listen(port, () => console.log(`Server is running on ${origin}`));
})();
