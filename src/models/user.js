const { Sequelize, Database, serialize, serializeMany } = require('../services/database');
const { NotFoundError, CredentialsError } = require('../services/errors');
const _ = require('lodash');
const { bcrypt, bcryptCompare } = require('../services/crypt');

const fields = {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
};

const relations = {

};

const timestamps = {
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  deletedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
};

const User = Database.define('user', fields, { paranoid: true });

User.serialize = serializeMany;
User.prototype.serialize = serialize;
User.serializerSchema = {
  include: ['@all'],
  exclude: ['deletedAt', 'password'],
};

const ALLOWED_CREATE_FIELDS = ['firstName', 'lastName', 'email'];
const ALLOWED_UPDATE_FIELDS = ['firstName', 'lastName', 'email'];

User.findByUserId = async function (userId) {
  try {
    const query = { where: { id: userId }, rejectOnEmpty: true };
    return await this.findOne(query);
  } catch(err){throw NotFoundError;}
};

User.findByEmail = async function (email = '',  rejectOnEmpty = true) {
  try {
    const query = { where: { email: email.toLowerCase() }, rejectOnEmpty };
    return this.findOne(query);
  } catch (err) {throw NotFoundError;}
};

User.getUserList = async function () {
  const query = { where: { } };
  return this.findAll(query);
};

User.createUser = async function (body) {
  const fields = _.pick(body, ALLOWED_CREATE_FIELDS);
  fields.password = bcrypt(body.password);
  return this.create(fields);
};

User.prototype.updateUser = async function (body) {
  const fields = _.pick(body, ALLOWED_UPDATE_FIELDS);
  Object.keys(fields).forEach((v) => this.set(v, fields[v]));
  return this.save();
};

User.removeUser = async function (userId) {
  return this.destroy({ where: { id: userId } });
};

User.prototype.authenticate = function (password) {
  if (!bcryptCompare(password, this.password)) {
    throw CredentialsError;
  }
};

module.exports = User;