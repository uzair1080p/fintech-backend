const logger = require('../logger').child(__filename);

const status = async (req, res, next) => {
  try {
    const now = new Date().getTime();
    res.success({
      status: 'OK',
      uptime: parseTime((now - START_DATE) / 1000),
    });
  } catch (err) {next(err);}
};

Object.assign(status, {
  description: 'Returns the server status and uptime.',
  required: {},
  optional: {},
  authenticated: false,
  returns: 'object',
});

const START_DATE = new Date();
const parseTime = (totalSeconds) => {
  const hh = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const mm = Math.floor(totalSeconds / 60);
  const ss = Math.floor(totalSeconds % 60);
  return `${hh < 10 ? '0' + hh : hh}:${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`;
};

module.exports = { status };