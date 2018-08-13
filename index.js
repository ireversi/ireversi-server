const app = require('express')();

app.get('/', (req, res)=> {
  res.json({
    message: 'hello.',
  });
});

app.listen(process.env.PORT || 10000);
