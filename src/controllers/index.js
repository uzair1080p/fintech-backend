const logger = require('../logger').child(__filename);
const express = require('express');
const router = module.exports = express.Router();
const { requireAuth } = require('../services/middleware');

/* System Routes */
const system = require('./system');
router.get('/system/status', system.status);

/* Auth Routes */
const auth = require('./auth');
router.post('/auth', auth.login);
router.post('/auth/refresh', requireAuth('refreshToken'), auth.refresh);
router.post('/auth/logout', auth.logout);

/* Generated Routes */

/* User Routes */
const users = require('./users');
router.get('/users/:userId', requireAuth('accessToken'), users.getUser);
router.post('/users', users.createUser);
router.put('/users', requireAuth('accessToken'), users.updateUser);

