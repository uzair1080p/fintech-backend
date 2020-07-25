const logger = require('../logger').child(__filename);
const { ENV } = require('../config');
const { ForbiddenError, AuthenticationError } = require('./errors');
const { jwtVerify, hmac, generateBytes } = require('../services/crypt');

exports.checkCSRF = (req, res, next) => {
  const nextToken = generateBytes(16, 'hex');
  const shouldCheck = ['post', 'put', 'delete'].indexOf(req.method) !== -1;
  const skipCheck = ENV === 'development' && /PostmanRuntime/.test(req.headers['user-agent']);
  const isTokenInvalid = req.headers['x-csrf-token'] !== req.signedCookies['csrfToken'];
  res.cookie('csrfToken', nextToken, { maxAge: 86400 * 90, httpOnly: false, signed: true });
  shouldCheck && !skipCheck && isTokenInvalid ? next(ForbiddenError) : next();
};

exports.requireAuth = (tokenToVerify) => {
  return (req, res, next) => {
    try {
      const clientIdent = hmac(req.headers['user-agent']);
      const token = req.signedCookies[tokenToVerify];
      if (!token) { return next(AuthenticationError); }

      const auth = jwtVerify(token);
      const route = req.method + ' ' + req.path;
      const isIdentInvalid = auth.clientIdent !== clientIdent;
      const isRouteInvalid = auth.validRoutes && auth.validRoutes.indexOf(route) === -1;
      if (isIdentInvalid || isRouteInvalid) { return next(AuthenticationError); }
      req.auth = auth;
      next();
    } catch (err) {
      next(AuthenticationError);
    }
  };
};