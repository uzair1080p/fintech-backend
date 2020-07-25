const { APP_NAME, ENV, LOG_LEVEL, LOG_HISTORY_LIMIT } = require('./config');
const path = require('path');
const LEVELS = ['debug', 'secure', 'info', 'warn', 'error'];
const HISTORY = [];

class Logger {
  constructor(filename = __filename, parent = null) {
    this._module = path.relative(__dirname, filename);
    this._level = LOG_LEVEL || 'info';
    this._children = [];
    this._parent = parent;
  }

  child(filename){
    const log = new Logger(filename, this);
    this._children.push(log);
    return log;
  }

  setLevel(level) {
    this._level = level;
  }

  debug() {
    this._print('debug', ...arguments);
  }

  info() {
    this._print('info', ...arguments);
  }

  log() {
    this._print('info', ...arguments);
  }

  warn() {
    this._print('warn', ...arguments);
  }

  error() {
    this._print('error', ...arguments);
  }

  secure() {
    this._print('secure', ...arguments);
  }

  history(level = null) {
    return level ? HISTORY.filter(h => h.level === level) : HISTORY;
  }

  _print(level) {
    let args = [].slice.call(arguments);
    args.shift();
    const log = {
      ts: new Date(),
      app: APP_NAME,
      env: ENV,
      module: this._module,
      level,
      contents: args,
    };

    if (level === 'secure') {
      //TODO - Encrypt logs containing secure data
    }

    if (ENV !== 'testing' && LEVELS.indexOf(this._level) <= LEVELS.indexOf(level)) {
      console.log(JSON.stringify(log));
    }

    HISTORY.push(log);
    if (HISTORY.length > LOG_HISTORY_LIMIT) {
      HISTORY.shift();
    }
  }
}

module.exports = new Logger();