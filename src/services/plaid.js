const logger = require('../logger').child(__filename);
const { PlaidError } = require('./errors');
const plaid = require('plaid');
const {
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  PLAID_ENV,
} = require('../config');

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV]
);

const getAccessToken = async (publicToken) => {
  try {
    return await client.exchangePublicToken(publicToken);
  } catch (err){
    console.log('getAccessToken error', err);
    throw PlaidError.fields({ error: err.error_code, publicToken });
  }
};

const getAccounts = async (account) => {
  try {
    return await client.getAccounts(account.accessToken);
  } catch (err){
    console.log('getaccounts error', err);
    throw PlaidError.fields({ error: err.error_code, publicToken: account.publicToken });
  }
};

const getTransactions = async (account, start = getStartDate(), end = getEndDate()) => {
  try {
    if(typeof start === 'number'){
      start = getStartDate(start);
    }
    return await client.getTransactions(account.accessToken, start, end, {
      account_ids: [account.id],
      count: 500
    });
  } catch (err){
    console.log('gettransactions error', err);
    throw PlaidError.fields({ error: err.error_code, publicToken: account.publicToken });
  }
};

const getInstitution = async (insId) => {
  try {
    return await client.getInstitutionById(insId, {include_optional_metadata: true});
  }  catch (err){
    console.log('getInstitutionsByAccount error', err);
    throw PlaidError.fields({ error: err.error_code });
  }
};

const validateWebhookToken = (kid) => {
  return new Promise((resolve, reject) => {
    client.getWebhookVerificationKey(kid, (err, result) => {
      if(err){reject(err);}
      resolve(result);
    });
  });
};

const getSandboxToken = async () => {
  try {
    return await client.sandboxPublicTokenCreate('ins_109509', ['transactions'], {
      override_username: 'user_custom',
      override_password: JSON.stringify({
        override_accounts: [{
          starting_balance: 10000,
          type: 'depository',
          subtype: 'checking',
          meta: {
            name: 'Checking Account 1'
          }
        }, {
          starting_balance: 20000,
          type: 'depository',
          subtype: 'savings',
          meta: {
            name: 'Savings Account 1'
          }
        }]
      })
    });
  } catch (err){
    console.log('getSandboxToken error', err);
    throw PlaidError.fields({ error: err.error_code });
  }
};

const getStartDate = (months = 12) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return `${date.getFullYear()}-${zeroPad(date.getMonth()+1)}-${zeroPad(date.getDate())}`;
};

const getEndDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${zeroPad(date.getMonth()+1)}-${zeroPad(date.getDate())}`;
};

const zeroPad = (num) => {
  return num < 10 ? `0${num}` : `${num}`;
};

module.exports = { getAccessToken, getAccounts, getSandboxToken, getTransactions, getInstitution, validateWebhookToken };

/*
console.log(PLAID_SECRET);
const account = {id: 'RVX5nymM1Dc8Yrkyw1a7TyvP18p0x9IyrNQ6K', accessToken: 'access-development-9abb2d76-2ab4-42a8-a021-058267b0e9cc'};
const fs = require('fs');
getTransactions(account, 6).then(res => {
  const results = res.transactions.filter(t => t.amount <= 0);
  fs.writeFileSync('./tx.json', JSON.stringify(results));
  console.log('done')
}).catch(err => console.log(err));


*/
