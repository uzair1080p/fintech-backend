const logger = require('../logger').child(__filename);
const { User } = require('../models');
const { ValidationError } = require('../services/errors');
const { login, refresh } = require('./auth');
const { test } = require('mocha');

const createUser = async (req, res, next) => {
  try {
    const body = req.body;

    if (body.password && body.password.length < 8) {
      return next(ValidationError.fields({ errors: ['Password must be at least 8 characters'] }));
    }

    const user = await User.createUser(body);
    return login(req, res, next);
  } catch (err) {next(err);}
};

Object.assign(createUser, {
  description: 'Creates a new user',
  required: {
    name: 'string',
    email: 'string',
    password: 'string',
  },
  optional: {},
  authenticated: false,
  returns: 'object',
});

const testUser = async (req, res, next) => {
  try {
    const body = req.body;

    if (body.password && body.password.length < 8) {
      return next(ValidationError.fields({ errors: ['Password must be at least 8 characters'] }));
    }


    return body;
  } catch (err) {next(err);}
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const body = req.body;
    const user = await User.findByUserId(userId);
    const updated = await user.updateUser(body);
    return refresh(req, res, next);
  } catch (err) {next(err);}
};

Object.assign(updateUser, {
  description: 'Updates a user record',
  required: {},
  optional: {
    name: 'string',
    email: 'string',
  },
  authenticated: true,
  returns: 'object',
});

const listUsers = async (req, res, next) => {
  try {
    const users = await User.getUserList();
    res.success(Processor.serialize(processors));
  } catch (err) {next(err);}
};

Object.assign(listUsers, {
  description: 'Returns an array of the users',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'array',
});

module.exports = { createUser, updateUser, listUsers, testUser };