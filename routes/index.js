require('dotenv').config();
const app = require('express')();

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
        consumes: ['application/json'],
        produces: ['application/json'],
    },
    apis: listFiles(path.join(__dirname, 'api')),
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/v1', require('./api/v1/index.js'));

app.listen(process.env.PORT || 10000);
