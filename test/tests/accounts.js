/* global describe, it */
const chai = require('chai');
const should = chai.should();
const { app } = require('../../src/index');
const DataStore = require('../datastore');
const agent = DataStore.agent;

const listAccounts = (done) => {
  const route = `/accounts`;
  agent
    .get(route)
    .set('authorization', DataStore.userToken)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('array');
      DataStore.saveRequest('get', 'accounts', route);
      DataStore.saveResponse('get', 'accounts', route, res.body);
      done();
    });
};

const listTransactions = (done) => {
  const route = `/transactions`;
  agent
    .get(route)
    .set('authorization', DataStore.userToken)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(false);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('get', 'accounts', route);
      DataStore.saveResponse('get', 'accounts', route, res.body);
      done();
    });
};

const createAccount = (done) => {
  const payload = {
    publicToken: 'generateSandboxToken'
  };
  const route = `/accounts`;
  agent
    .post(route)
    .set('authorization', DataStore.userToken)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('post', 'accounts', route, payload);
      DataStore.saveResponse('post', 'accounts', route, res.body);
      done();
    });
};

const removeAccount = (done) => {
  const accountId = DataStore.accountId;
  const route = `/accounts/${accountId}`;
  agent
    .delete(route)
    .set('authorization', DataStore.userToken)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('delete', 'accounts', route);
      DataStore.saveResponse('delete', 'accounts', route, res.body);
      done();
    });
};

module.exports = { listTransactions, listAccounts, createAccount, removeAccount };