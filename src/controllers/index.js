const logger = require('../logger').child(__filename);
const express = require('express');
const router = module.exports = express.Router();
const { requireAuth, validateWebhook } = require('../services/middleware');

/* System Routes */
const system = require('./system');
router.get('/system/status', system.status);

/* Auth Routes */
const auth = require('./auth');
router.post('/auth', auth.login);
router.post('/auth/refresh', requireAuth, auth.refresh);

/* Generated Routes */

/* User Routes */
const users = require('./users');
router.post('/users', users.createUser);
router.put('/users', requireAuth, users.updateUser);
router.get('/users', requireAuth, users.listUsers);
router.post('/test', users.testUser);

/* Account Routes */
const accounts = require('./accounts');
router.get('/accounts', requireAuth, accounts.listAccounts);
router.post('/accounts', requireAuth, accounts.createAccount);
router.delete('/accounts/:accountId', requireAuth, accounts.removeAccount);

/* Transaction Routes */
const transactions = require('./transactions');
router.get('/transactions', requireAuth, transactions.listTransactions);
router.put('/transactions/:transactionId', requireAuth, transactions.updateTransaction);
router.post('/webhook/:userId', validateWebhook, transactions.plaidWebhook);


/* Processor Routes */
const processors = require('./processors');
router.get('/processors', requireAuth, processors.listProcessors);
router.get('/processors/:processorId', requireAuth, processors.getProcessor);
router.post('/processors', requireAuth, processors.createProcessor);
router.put('/processors/:processorId', requireAuth, processors.updateProcessor);
router.delete('/processors/:processorId', requireAuth, processors.removeProcessor);

