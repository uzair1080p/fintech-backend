const logger = require('../logger').child(__filename);
const uuid = require('uuid/v4');
const { UnknownError, BaseError, NotFoundError, ValidationError } = require('../services/errors');
const ORIGIN_DOMAIN_REGEX = /https?:\/\//g;

exports.responseHandler = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  req.requestId = res.requestId = uuid();
  res.success = success;
  res.failure = failure;
  if ((req.headers['host'] || req.headers['origin'] || '').match(ORIGIN_DOMAIN_REGEX)) {
    res.originDomain = res.originDomain.replace(ORIGIN_DOMAIN_REGEX, '');
  }
  logger.info('request', req.requestId, ip, req.method, req.path);
  logger.debug('requestVerbose', req.requestId, req.headers, req.body);
  next();
};

exports.errorHandler = (err, req, res, next) => {
  if (err instanceof BaseError) { return res.failure(err);}
  switch (err.name) {
    case 'SequelizeValidationError':
      return res.failure(ValidationError.fields({ errors: err.errors.map(e => e.message) }));
  }
  console.error('unhandledError', err); // Intentionally log unhandled errors with console
  res.failure(UnknownError);
};

exports.notFoundHandler = (req, res, next) => next(NotFoundError);

function success(data = {}, status = 200) {
  const { requestId } = this;
  const body = { success: true, requestId, data };
  logger.info('successResponse', requestId, status, body);
  this.status(status).json(body);
}

function failure(err) {
  const { requestId } = this;
  logger.info('failureResponse', requestId, err.status, err);
  this.status(err.status).json({ success: false, requestId, data: err });
}