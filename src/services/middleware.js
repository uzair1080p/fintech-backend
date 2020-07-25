const logger = require('../logger').child(__filename);
const { ENV } = require('../config');
const { User } = require('../models');
const { AuthenticationError } = require('./errors');
const { jwtVerify, jwtDecode, hmac } = require('../services/crypt');
const { validateWebhookToken } = require('./plaid');

exports.requireAuth = async (req, res, next) => {
  try {
    const clientIdent = hmac(req.headers['user-agent']);
    const token = req.headers['authorization'];
    if (!token) { return next(AuthenticationError); }
    req.auth = jwtVerify(token);
    req.user = await User.findByUserId(req.auth.userId);
    // const isIdentInvalid = auth.clientIdent !== clientIdent;
    // if (isIdentInvalid) { return next(AuthenticationError); }
    next();
  } catch (err) {
    next(AuthenticationError);
  }
};

exports.validateWebhook = async (req, res, next) => {
  try {
    const plaidToken = req.headers['plaid-verification'];
    const { userId } = req.params;
    if (!plaidToken || !userId) { return next(AuthenticationError); }
    const { header } = jwtDecode(plaidToken);
    if(header.alg !== 'ES256' || !header.kid){
      return next(AuthenticationError);
    }
    const result = await validateWebhookToken(header.kid);
    req.user = await User.findByUserId(userId);
    next();
  } catch (err) {
    next(AuthenticationError);
  }
};