/* global describe, it, before, after, beforeEach */
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const { app, Database } = require('../src/index.js');
const DataStore = require('./datastore');
const agent = DataStore.agent = chai.request.agent(app);
const Cookie = require('cookiejar');
const TESTPATH = path.join(__dirname, 'tests');
const TESTFILES = fs.readdirSync(TESTPATH);
const tests = {};

TESTFILES.forEach((v) => Object.assign(tests, { ...require(path.join(TESTPATH, v)) }));

describe('API.v1 Tests', function () {
  this.timeout(5 * 1000);
  before(done => app.on('app_ready', () => done()));

  beforeEach(done => {
    const csrfToken = agent.jar.getCookie('csrfToken', Cookie.CookieAccessInfo.All);
    if(csrfToken && csrfToken.value){
      DataStore.CSRFToken = decodeURIComponent(csrfToken.value).match(/^s:(.*)\..*$/)[1];
    }
    done();
  });

  /* Run test functions in desired order */
  it('Should display the system status as OK with an uptime', tests.status);
  it('Should create a new user', tests.createUser);
  it('Should login a user', tests.login);
  it('Should refresh the users auth token', tests.refresh);
  it('Should update the user', tests.updateUser);
  it('Should get a user', tests.getUser);
  it('Should logout the user and clear any auth cookies', tests.logout);

  after(done => {
    DataStore.writeDocumentation();
    done();
    process.exit();
  });
});