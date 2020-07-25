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
exports.CredentialsError = new BaseError(401, 'CredentialsError', 'The email or password entered is invalid');
exports.EmailExistsError = new BaseError(400, 'EmailExistsError', 'The email address entered is already in use. Please login.');
exports.PlaidError = new BaseError(400, 'PlaidError', 'An error occurred while interacting with plaid');
exports.DuplicateAccountError = new BaseError(400, 'DuplicateAccountError', 'The account entered already exists');
exports.BadMatchStringError = new BaseError(400, 'BadMatchStringError', 'The selected transactions dont seem to match this processor');
exports.NoMatchesFoundError = new BaseError(404, 'NoMatchesFoundError', 'No transactions found that match this processor');
