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
  name: {
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
  onBoarding: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  averageFeePercent: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalFees: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalIncome: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '-',
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

const ALLOWED_CREATE_FIELDS = ['name', 'email'];
const ALLOWED_UPDATE_FIELDS = ['name', 'email', 'onBoarding'];

User.findByUserId = async function (userId) {
  try {
    const query = { where: { id: userId }, rejectOnEmpty: true };
    return await this.findOne(query);
  } catch(err){throw NotFoundError;}
};

User.findByEmail = async function (email = '',  rejectOnEmpty = true) {
  try {
    const query = { where: { email: email.toLowerCase() }, rejectOnEmpty };
    return await this.findOne(query);
  } catch (err) {throw NotFoundError;}
};

User.getUserList = async function () {
  const query = { where: { } };
  return this.findAll(query);
};

User.createUser = async function (body) {
  const fields = _.pick(body, ALLOWED_CREATE_FIELDS);
  fields.email = (fields.email || '').toLowerCase();
  fields.password = bcrypt(body.password);
  return this.create(fields);
};

User.prototype.updateUser = async function (body) {
  const fields = _.pick(body, ALLOWED_UPDATE_FIELDS);
  Object.keys(fields).forEach((v) => this.set(v, fields[v]));
  return this.save();
};

User.prototype.updateUserAggregate = async function (body) {
  Object.keys(body).forEach((v) => this.set(v, body[v]));
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