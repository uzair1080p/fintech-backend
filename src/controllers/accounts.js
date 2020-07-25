const logger = require('../logger').child(__filename);
const { ENV } = require('../config');
const { Account, Transaction } = require('../models');
const { ValidationError } = require('../services/errors');
const { getAccessToken, getAccounts, getInstitution } = require('../services/plaid');

const listAccounts = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const accounts = await Account.getAccountList(userId);
    // const txs = await getTransactions(accounts[0]);
    // await Transaction.createTransactions(userId, accounts[0].id, txs.transactions, []);
    res.success(Account.serialize(accounts));
  } catch (err) {next(err);}
};

Object.assign(listAccounts, {
  description: 'Returns an array of accounts',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'array',
});

const createAccount = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    let body = req.body;

    console.log('body', body);

    if(!body.institutionId || !body.name || !body.last4){
      return next(ValidationError.fields({errors: ['Missing fields for plaid']}));
    }

    await Account.checkExistingAccount(userId, body);

    const accessToken = await getAccessToken(body.publicToken);
    const accounts = await getAccounts({accessToken: accessToken.access_token, publicToken: body.publicToken});
    const selectedAccount = accounts.accounts.find(i => i.account_id === body.accountId);

    if(!selectedAccount){
      return next(ValidationError.fields({errors: ['No accounts found for this item']}));
    }

    const { institution } = await getInstitution(body.institutionId);
    const account = await Account.createAccount(userId, accessToken, selectedAccount, institution, body);
    res.success(account.serialize());
  } catch (err) {next(err);}
};

Object.assign(createAccount, {
  description: 'Creates a new account',
  required: {
    publicToken: 'string',
    accountId: 'string',
    last4: 'string',
    name: 'string',
    institutionId: 'string',
  },
  optional: {},
  authenticated: true,
  returns: 'object',
});

const removeAccount = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { accountId } = req.params;
    const removed = await Account.removeAccount(accountId, userId);
    res.success({removed});
  } catch (err) {next(err);}
};

Object.assign(removeAccount, {
  description: 'Removes an existing account',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

module.exports = { listAccounts, createAccount, removeAccount };