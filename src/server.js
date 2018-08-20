const app = require('./routes/app.js');
const { connectDB } = require('./utils/db.js');
const { port, nodeEnv } = require('./config.js');

(async () => {
  await connectDB();
  if (nodeEnv === 'development') {
    const { serve, setup } = require('./utils/swaggerUi.js');
    app.use('/api-docs', serve, setup);
    console.log(`API docs: http://localhost:${port}/api-docs`);
  }
  app.listen(port, () => console.log(`Server is running on port ${port}`));
})();
