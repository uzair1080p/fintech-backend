const logger = require('../logger').child(__filename);
const { jwtSign, hmac } = require('../services/crypt');
const { User } = require('../models');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIdent = hmac(req.headers['user-agent']);
    const user = await User.findByEmail(email);
    user.authenticate(password);

    const accessTokenPayload = { clientIdent, userId: user.id, email: user.email };
    const refreshTokenPayload = { clientIdent, userId: user.id };
    const opts = { ...TOKEN_OPTS, domain: res.originDomain };
    res.cookie('accessToken', jwtSign(accessTokenPayload, ACCESS_TOKEN_OPTS), opts);
    res.cookie('refreshToken', jwtSign(refreshTokenPayload, REFRESH_TOKEN_OPTS), opts);
    res.success();
  } catch (err) {next(err);}
};

Object.assign(login, {
  description: 'Accepts input of credentials and grants an access and refresh token to access authenticated resources',
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
    const refreshTokenPayload = { clientIdent, userId: user.id };
    const opts = { ...TOKEN_OPTS, domain: res.originDomain };
    res.cookie('accessToken', jwtSign(accessTokenPayload, ACCESS_TOKEN_OPTS), opts);
    res.cookie('refreshToken', jwtSign(refreshTokenPayload, REFRESH_TOKEN_OPTS), opts);
    res.success();
  } catch (err) {next(err);}
};

Object.assign(refresh, {
  description: 'Uses the refresh token to re-validate the authenticated users permission claims',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.success();
  } catch (err) {next(err);}
};

Object.assign(logout, {
  description: 'Removes the cookies for authentication, ending the clients access to authenticated resources',
  required: {},
  optional: {},
  authenticated: false,
  returns: 'object',
});

const TOKEN_OPTS = { maxAge: 86400 * 90, httpOnly: true, signed: true };
const ACCESS_TOKEN_OPTS = { expiresIn: '5m' };
const REFRESH_TOKEN_OPTS = { expiresIn: '90d' };
module.exports = { login, refresh, logout };