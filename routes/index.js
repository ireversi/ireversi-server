require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 10000;

if (process.env.NODE_ENV === 'develop') {
  const path = require('path');
  const listFiles = require('../utils/listFiles.js');
  const swaggerUi = require('swagger-ui-express');
  const swaggerJSDoc = require('swagger-jsdoc');
  const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        swagger: '2.0',
        info: {
            title: 'iReversi API',
            version: '0.0.1',
            description: 'Document for iReversi API',
        },
        basePath: '/api/v1',
        consumes: ['application/x-www-form-urlencoded'],
        produces: ['application/json'],
    },
    apis: listFiles(path.join(__dirname, 'api')),
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Server running on http://localhost:${PORT}/`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
}

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`, {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  dbName: process.env.MONGO_DBNAME,
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

app.use(express.urlencoded({ extended: false }));
app.use('/api/v1', require('./api/v1/index.js'));

app.listen(PORT);
