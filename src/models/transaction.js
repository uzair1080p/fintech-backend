const { Sequelize, Database, serialize, serializeMany } = require('../services/database');
const { NotFoundError } = require('../services/errors');
const _ = require('lodash');

const fields = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  beforeFeeAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  currency: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: false,
    defaultValue: [],
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pending: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  userSelectedProcessor: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  accountId: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id',
    },
  },
  processorId: {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'processors',
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
};

const Transaction = Database.define('transaction', fields, { paranoid: false });

Transaction.serialize = serializeMany;
Transaction.prototype.serialize = serialize;
Transaction.serializerSchema = {
  include: ['@all', 'processor'],
  postSerialize: (serialized, orig) => {
    if(orig.processor){
      console.log(serialized.id, 'hasProcessor');
      serialized.processor = orig.processor.serialize();
      if(serialized.processor.percentFee > 0){
        serialized.beforeFeeAmount = Math.round(orig.amount / (1-(serialized.processor.percentFee / 100 / 100)));
        console.log(serialized.id, 'hasFee', serialized.processor.percentFee, serialized.amount, serialized.beforeFeeAmount);
      }

    }
    return serialized;
  }
};

const ALLOWED_CREATE_FIELDS = [];
const ALLOWED_UPDATE_FIELDS = ['processorId'];

Transaction.findByTransactionId = async function (transactionId, userId) {
  try {
    const query = { where: { id: transactionId, userId }, rejectOnEmpty: true };
    return await this.findOne(query);
  } catch(err){throw NotFoundError;}
};

Transaction.getTransactionList = async function (userId, accountId, processorId, limit, offset) {
  const query = {
    where: { userId },
    include: [{
      model: require('./index').Processor,
      as: 'processor',
      required: false,
    }],
    order: [['date', 'DESC'], ['name', 'DESC']]
  };
  if (accountId) {
    query.where.accountId = accountId;
  }
  if (processorId) {
    query.where.processorId = accountId;
  }
  if(limit){
    query.limit = limit;
  }
  if(offset){
    query.offset = offset;
  }

  console.log('getTransactionList query', query);
  return this.findAll(query);
};

Transaction.createTransactions = async function (userId, accountId, txs, processors) {
  const transactions = txs.filter(tx => tx.account_id === accountId)
    .map(tx => {
      const t = {
        id: tx.transaction_id,
        userId,
        accountId: accountId,
        name: tx.name,
        date: new Date(tx.date),
        amount: Math.floor(tx.amount * 100),
        currency: tx.iso_currency_code,
        tags: tx.category,
        type: tx.transaction_type,
        pending: tx.pending,
      };

      t.beforeFeeAmount = t.amount;

      if(processors && processors.length > 0){
        //TODO -determine which processor this tx belongs to, set processorId and beforeFeeAmount
      }

      return t;
    });
  return this.bulkCreate(transactions, { ignoreDuplicates: true });
};

Transaction.prototype.updateTransaction = async function (body) {
  const fields = _.pick(body, ALLOWED_UPDATE_FIELDS);
  Object.keys(fields).forEach((v) => this.set(v, fields[v]));
  if(body.processorId){
    this.set('userSelectedProcessor', true);
  } else if(body.processorId === null){
    this.set('userSelectedProcessor', false);
  }
  return this.save();
};

Transaction.removeTransactions = async function (transactionIds) {
  return this.destroy({ where: { id: transactionIds } });
};

module.exports = Transaction;