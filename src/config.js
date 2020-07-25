const getVar = (name, val, format = (value) => value) =>
  process.env[name] ? format(process.env[name]) : val;

module.exports = {
  APP_NAME: getVar('APP_NAME', 'Skeleton.v2'),
  PORT: getVar('PORT', 8080, parseInt),
  ENV: getVar('NODE_ENV', 'development'),
  LOG_LEVEL: getVar('LOG_LEVEL', 'secure'),
  LOG_HISTORY_LIMIT: getVar('LOG_HISTORY_LIMIT', 100, parseInt),
  DATABASE_URL: getVar('DATABASE_URL', 'postgres://postgres:secret@localhost/skeleton'),
  SECRET: getVar('SECRET', 'Y73SctMTG2zZ7chPltcO7Osk39YxA1Ys'),
  ROUNDS: getVar('ROUNDS', 8, parseInt),
  PLAID_CLIENT_ID: getVar('PLAID_CLIENT_ID', ''),
  PLAID_SECRET: getVar('PLAID_SECRET', ''),
  PLAID_PRODUCTS: getVar('PLAID_PRODUCTS', 'transactions'),
  PLAID_COUNTRY_CODES: getVar('PLAID_COUNTRY_CODES', 'US,CA,GB,FR,ES,IE'),
  PLAID_ENV: getVar('PLAID_ENV', 'sandbox'),
  PLAID_PUBLIC_KEY: getVar('PLAID_PUBLIC_KEY', ''),
};