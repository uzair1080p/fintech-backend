const logger = require('../logger').child(__filename);
const { User } = require('../models');
const { isValidPassword } = require('../services/crypt');
const {} = require('../services/errors');

const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByUserId(userId);
    res.success(user.serialize());
  } catch (err) {next(err);}
};

Object.assign(getUser, {
  description: 'Returns a single record',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

const createUser = async (req, res, next) => {
  try {
    const body = req.body;

    if (!isValidPassword(body.password)) {
      return next(ValidationError.fields({ errors: ['Invalid characters in password'] }));
    }

    const user = await User.createUser(body);
    res.success(user.serialize());
  } catch (err) {next(err);}
};

Object.assign(createUser, {
  description: 'Creates a new user',
  required: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    password: 'string',
  },
  optional: {},
  authenticated: false,
  returns: 'object',
});

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const body = req.body;
    const user = await User.findByUserId(userId);
    const updated = await user.updateUser(body);
    res.success(updated.serialize());
  } catch (err) {next(err);}
};

Object.assign(updateUser, {
  description: 'Updates a single record',
  required: {},
  optional: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
  },
  authenticated: true,
  returns: 'object',
});

module.exports = { getUser, createUser, updateUser };