const { PORT, ENV, SECRET } = require('./config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { responseHandler, errorHandler, notFoundHandler } = require('./services/response');
const { Database } = require('./services/database');
const { checkCSRF } = require('./services/middleware');
const routes = require('./controllers');
const logger = require('./logger').child(__filename);
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(responseHandler);
app.use(cors({origin: true, credentials: true}));
app.use(cookieParser(SECRET));
// app.use(checkCSRF);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

Database.authenticate()
  .then(() => {
    logger.info('Connected to database');
    app.listen(PORT, listening);
  })
  .catch(err => logger.error(err, 'Unable to connect to the database'));

const listening = () => {
  logger.info(`App listening on port ${PORT}`);
  if (ENV === 'testing') {
    setTimeout(() => {
      app.emit('app_ready');
    }, 1000);
  }
};

module.exports = { app, Database };