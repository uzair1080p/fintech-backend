import { AsyncStorage } from 'react-native';
import config from '../config';

const BASE_URL = config.API_URL;
let ACCESS_TOKEN = null;

class APIWrapper {

  /**
   * Description: Returns the server status and uptime.
   * 
   */
  static async status() {
    return await this._makeRequest('status', 'get', `/system/status`);
  }

  /**
   * Description: Accepts input of credentials and grants an access token to access authenticated resources
   * 
   * @param {object} body
   * @param {string} body.email (required)
   * @param {string} body.password (required)
   */
  static async login(body) {
    return await this._makeRequest('login', 'post', `/auth`, body);
  }

  /**
   * Description: Uses the refresh token to re-validate the authenticated users permission claims
   * 
   */
  static async refresh() {
    return await this._makeRequest('refresh', 'post', `/auth/refresh`);
  }

  /**
   * Description: Creates a new user
   * 
   * @param {object} body
   * @param {string} body.name (required)
   * @param {string} body.email (required)
   * @param {string} body.password (required)
   */
  static async createUser(body) {
    return await this._makeRequest('createUser', 'post', `/users`, body);
  }

  /**
   * Description: Updates a user record
   * 
   * @param {object} body
   * @param {string} body.name (optional)
   * @param {string} body.email (optional)
   */
  static async updateUser(body) {
    return await this._makeRequest('updateUser', 'put', `/users`, body);
  }

  /**
   * Description: Returns an array of accounts
   * 
   */
  static async listAccounts() {
    return await this._makeRequest('listAccounts', 'get', `/accounts`);
  }

  /**
   * Description: Creates a new account
   * 
   * @param {object} body
   * @param {string} body.publicToken (required)
   * @param {string} body.accountId (required)
   * @param {string} body.last4 (required)
   * @param {string} body.name (required)
   * @param {string} body.institutionId (required)
   */
  static async createAccount(body) {
    return await this._makeRequest('createAccount', 'post', `/accounts`, body);
  }

  /**
   * Description: Removes an existing account
   * 
   * @param {uuid} accountId
   */
  static async removeAccount(accountId) {
    return await this._makeRequest('removeAccount', 'delete', `/accounts/${accountId}`);
  }

  /**
   * Description: Returns an array of transactions
   * 
   * @param {object}  body
   * @param {string}  body.accountId (optional)
   * @param {string}  body.processorId (optional)
   * @param {integer} body.limit (optional)
   * @param {integer} body.offset (optional)
   */
  static async listTransactions(body) {
    return await this._makeRequest('listTransactions', 'get', `/transactions`, body);
  }

  /**
   * Description: Updates an existing processor
   * 
   * @param {uuid}   transactionId
   * @param {object} body
   * @param {string} body.processorId (optional)
   */
  static async updateTransaction(transactionId, body) {
    return await this._makeRequest('updateTransaction', 'put', `/transactions/${transactionId}`, body);
  }

  /**
   * Description: Plaid Only - Do Not Implement
   * 
   * @param {uuid} userId
   */
  static async plaidWebhook(userId) {
    return await this._makeRequest('plaidWebhook', 'post', `/webhook/${userId}`);
  }

  /**
   * Description: Returns an array of the users processors
   * 
   */
  static async listProcessors() {
    return await this._makeRequest('listProcessors', 'get', `/processors`);
  }

  /**
   * Description: Returns a single processor
   * 
   * @param {uuid} processorId
   */
  static async getProcessor(processorId) {
    return await this._makeRequest('getProcessor', 'get', `/processors/${processorId}`);
  }

  /**
   * Description: Creates a new processor account for the user
   * 
   * @param {object}  body
   * @param {string}  body.name (required)
   * @param {string}  body.color (required)
   * @param {integer} body.percentFee (required)
   * @param {boolean} body.test (optional)
   */
  static async createProcessor(body) {
    return await this._makeRequest('createProcessor', 'post', `/processors`, body);
  }

  /**
   * Description: Updates an existing processor
   * 
   * @param {uuid}    processorId
   * @param {object}  body
   * @param {string}  body.name (optional)
   * @param {string}  body.color (optional)
   * @param {integer} body.percentFee (optional)
   */
  static async updateProcessor(processorId, body) {
    return await this._makeRequest('updateProcessor', 'put', `/processors/${processorId}`, body);
  }

  /**
   * Description: Removes a payment processor
   * 
   * @param {uuid} processorId
   */
  static async removeProcessor(processorId) {
    return await this._makeRequest('removeProcessor', 'delete', `/processors/${processorId}`);
  }


  static async loadAccessToken() {
    let token = await AsyncStorage.getItem('accessToken');
    if(token){
      ACCESS_TOKEN = token;
      return await this.refresh();
    }
    return false;
  };

  static async setAccessToken(token) {
    await AsyncStorage.setItem('accessToken', token);
    ACCESS_TOKEN = token;
  };

  static async clearAccessToken() {
    await AsyncStorage.removeItem('accessToken');
    ACCESS_TOKEN = null;
  };

  static async _makeRequest(name, method, route, body) {
    try {
      let url = BASE_URL + route;
      const opts = {
        method,
        headers: {'content-type': 'application/json'},
      };

      if(ACCESS_TOKEN){
        opts.headers['authorization'] = ACCESS_TOKEN;
      }

      if(body){
        if(method === 'get' && body && Object.keys(body).length){
          url += createQueryString(body);
        } else {
          opts.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, opts);
      const text = await response.text();
      const data = JSON.parse(text);
      if(response.status >= 200 && response.status < 300){
        if(response.headers.has('x-access-token')){
          await this.setAccessToken(response.headers.get('x-access-token'));
        }
        return data.data;
      } else {
        throw new APIError(data.data);
      }
    } catch(errResp) {
      throw (errResp instanceof APIError) ? errResp : new NetworkError(errResp.status);
    }
  }
}

const createQueryString = (values) => {
  let str = '?';
  let first = true;
  Object.keys(values).forEach((key) => {
    if(!first){str += '&';}
    str += `${key}=${values[key]}`;
    first = false;
  });
  return str;
};

class APIError extends Error {
  constructor(apiErr = {}){
    super();
    const { name, message, status } = apiErr;
    Object.assign(this, { requestId: apiErr.requestId, name, message, status });
  }
}

class NetworkError extends APIError {
  constructor(status){
    super({
      name: 'NetworkError',
      message: 'Network error, unable to connect to server',
      status: status
    });
  }
}

export {APIWrapper, APIError, NetworkError};