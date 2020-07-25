const logger = require('../logger').child(__filename);
const { SECRET, ROUNDS } = require('../config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d|.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,64}$/;

exports.bcrypt = (password) => bcrypt.hashSync(password + SECRET, ROUNDS);

exports.bcryptCompare = (password, hash) => bcrypt.compareSync(password + SECRET, hash);

exports.hmac = (str = '') => crypto.createHmac('sha256', SECRET).update(str).digest('hex');

exports.generateBytes = (n = 32, format = 'base64') => crypto.randomBytes(n).toString(format);

exports.md5 = (str = '') => crypto.createHash('md5').update(str).digest('hex');

exports.jwtSign = (payload, opts) => jwt.sign(payload, SECRET, opts);

exports.jwtVerify = (token = '') => jwt.verify(token, SECRET);

exports.isValidPassword = (str = '') => PASSWORD_REGEX.test(str);