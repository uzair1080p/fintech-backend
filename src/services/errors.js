class BaseError extends Error {
  constructor(status, name, message, fields) {
    super();
    this.status = status || 500;
    this.name = name || 'UnknownError';
    this.message = message || 'An unknown error has occurred';
    if (fields) {Object.assign(this, fields);}
  }

  fields(data) {
    return new BaseError(this.status, this.name, this.message, data);
  }
}

// TODO - Define custom errors here
exports.BaseError = BaseError;
exports.UnknownError = new BaseError();
exports.NotFoundError = new BaseError(404, 'NotFoundError', 'The resource you requested was not found');
exports.ForbiddenError = new BaseError(403, 'ForbiddenError', 'The action you are attempting to perform is forbidden');
exports.AuthenticationError = new BaseError(401, 'AuthenticationError', 'The current session is invalid, refresh auth or login again');
exports.ValidationError = new BaseError(400, 'ValidationError', 'The input provided has errors, please correct them before submitting again');
exports.CredentialsError = new BaseError(401, 'CredentialsError', 'The username or password entered is invalid');