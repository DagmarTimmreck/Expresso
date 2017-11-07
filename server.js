const Express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser-json');
const morgan = require('morgan');

const app = new Express();
module.exports = app;

const PORT = process.env.PORT || 4000;

// use cors for cross origin requests
app.use(cors());

// automatically parse json body to req.body
app.use(bodyParser.json());

// logging with dev infos
app.use(morgan('dev'));

// Mount apiRouter below at the '/api' path.
const apiRouter = require('./server/api.js');

app.use('/api', apiRouter);

// simple error handler
app.use((err, req, res, next) => {
  if (!err.statusCode) {
    res.status(500);
  }
  console.log(err);
  res.send({ message: err.message });
});

// serve static content from folder 'public'
app.use(Express.static('public'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
