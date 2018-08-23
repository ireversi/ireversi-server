const app = require('./routes/app.js');
const { connectDB } = require('./utils/db.js');
const { port, origin } = require('./config.js');
const { serve, setup } = require('./utils/swaggerUi.js');

(async () => {
  await connectDB();

  const docsPath = '/api-docs/v1';
  app.use(docsPath, serve, setup);
  console.log(`API docs: ${origin}${docsPath}`);

  app.listen(port, () => console.log(`Server is running on ${origin}`));
})();
