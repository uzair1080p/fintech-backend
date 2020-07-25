require('dotenv').config();
const config = require('./src/config');

module.exports = {
  'testing': {
    'url': config.DATABASE_URL,
    'dialect': 'postgres',
  },
  'development': {
    'url': config.DATABASE_URL,
    'dialect': 'postgres',
  },
  'production': {
    'url': config.DATABASE_URL,
    'dialect': 'postgres',
  },
};