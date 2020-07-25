const logger = require('../logger').child(__filename);

/* Generated Relations */


/* User Relations */
const User = exports.User = require('./user');


/* Account Relations */
const Account = exports.Account = require('./account');
Account.belongsTo(User, {as: 'user', foreignKey: 'userId'});
User.hasMany(Account, {as: 'accounts', foreignKey: 'userId'});

/* Processor Relations */
const Processor = exports.Processor = require('./processor');
Processor.belongsTo(User, {as: 'user', foreignKey: 'userId'});
User.hasMany(Processor, {as: 'processors', foreignKey: 'userId'});

/* Transaction Relations */
const Transaction = exports.Transaction = require('./transaction');
Transaction.belongsTo(User, {as: 'user', foreignKey: 'userId'});
Transaction.belongsTo(Account, {as: 'account', foreignKey: 'accountId'});
Transaction.belongsTo(Processor, {as: 'processor', foreignKey: 'processorId'});
Account.hasMany(Transaction, {as: 'transactions', foreignKey: 'accountId'});
User.hasMany(Transaction, {as: 'transactions', foreignKey: 'userId'});

