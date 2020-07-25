const logger = require('../logger').child(__filename);
const { jwtSign, hmac } = require('../services/crypt');
const { User } = require('../models');
const { CredentialsError, AuthenticationError } = require('../services/errors');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIdent = hmac(req.headers['user-agent']);
    const user = await User.findByEmail(email);
    user.authenticate(password);

    const accessTokenPayload = { clientIdent, userId: user.id, email: user.email };
    res.set('x-access-token', jwtSign(accessTokenPayload, ACCESS_TOKEN_OPTS));
    res.success(user.serialize());
  } catch (err) {next(CredentialsError);}
};

Object.assign(login, {
  description: 'Accepts input of credentials and grants an access token to access authenticated resources',
  required: {
    email: 'string',
    password: 'string',
  },
  optional: {},
  authenticated: false,
  returns: 'object',
});

const refresh = async (req, res, next) => {
  try {
    const { userId, clientIdent } = req.auth;
    const user = await User.findByUserId(userId);

    const accessTokenPayload = { clientIdent, userId: user.id, email: user.email };
    res.set('x-access-token', jwtSign(accessTokenPayload, ACCESS_TOKEN_OPTS));
    res.success(user.serialize());
  } catch (err) {next(AuthenticationError);}
};

Object.assign(refresh, {
  description: 'Uses the refresh token to re-validate the authenticated users permission claims',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

const ACCESS_TOKEN_OPTS = { expiresIn: '90d' };
module.exports = { login, refresh };