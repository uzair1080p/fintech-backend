const { Sequelize, Database, serialize, serializeMany } = require('../services/database');
const { NotFoundError, DuplicateAccountError } = require('../services/errors');
const _ = require('lodash');
const { Op } = Sequelize;

const fields = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  institutionId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last4: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  plaidItemId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  publicToken: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
  },
  numTransactions: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  institutionColor: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
  institutionLogo: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
  },
};

const relations = {
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
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

const Account = Database.define('account', fields, { paranoid: true });

Account.serialize = serializeMany;
Account.prototype.serialize = serialize;
Account.serializerSchema = {
  include: ['@all', 'transactions'],
  exclude: ['deletedAt', 'plaidItemId', 'accessToken'],
  postSerialize: (serialized, orig) => {
    if(orig.transactions){
      serialized.transactions = require('./index').Transaction.serialize(orig.transactions);
    }
    return serialized;
  }
};

const ALLOWED_CREATE_FIELDS = [];
const ALLOWED_UPDATE_FIELDS = ['displayName'];

Account.findByAccountId = async function (accountId, userId) {
  try {
    const query = { where: { id: accountId }, rejectOnEmpty: true };
    if(userId){
      query.where.userId = userId;
    }
    return await this.findOne(query);
  } catch(err){throw NotFoundError;}
};

Account.findByPlaidItemId = async function (plaidItemId, userId) {
  try {
    const query = { where: { plaidItemId }, rejectOnEmpty: true };
    if(userId){
      query.where.userId = userId;
    }
    return await this.findOne(query);
  } catch(err){throw NotFoundError;}
};

Account.getAccountList = async function (userId) {
  const query = {
    where: { userId },
    include: [{
      model: require('./index').Transaction,
      as: 'transactions',
      order: [['date', 'DESC']],
      required: false,
      where: { processorId: {[Op.ne]: null} },
      include: [{
        model: require('./index').Processor,
        as: 'processor',
        required: true,
      }]
    }]
  };
  return this.findAll(query);
};

Account.checkExistingAccount = async function(userId, body){
  const { institutionId, name, last4 } = body;
  const query = { where: { userId, institutionId, name, last4 }, rejectOnEmpty: false };
  const result = await this.findAll(query);
  if(result.length > 0){
    throw DuplicateAccountError;
  }
};

Account.createAccount = async function (userId, accessToken, selectedAccount, ins, body) {
  const fields = {
    id: selectedAccount.account_id,
    userId,
    institutionId: body.institutionId,
    name: selectedAccount.name,
    displayName: selectedAccount.name,
    last4: selectedAccount.mask,
    plaidItemId: accessToken.item_id,
    accessToken: accessToken.access_token,
    publicToken: body.publicToken,
    institutionColor: ins.primary_color,
    institutionLogo: ins.logo,
  };
  return this.create(fields);
};

Account.prototype.updateAccount = async function (body) {
  const fields = _.pick(body, ALLOWED_UPDATE_FIELDS);
  Object.keys(fields).forEach((v) => this.set(v, fields[v]));
  return this.save();
};

Account.removeAccount = async function (accountId, userId) {
  const query = { where: { id: accountId } };
  if(userId){
    query.where.userId = userId;
  }
  return this.destroy(query);
};

module.exports = Account;