/* global describe, it */
const chai = require('chai');
const should = chai.should();
const { app } = require('../../src/index');
const DataStore = require('../datastore');
const agent = DataStore.agent;

const login = (done) => {
  const payload = {
    email: 'bob@dole.com',
    password: 'ilikeapples12'
  };
  const route = `/auth`;
  agent
    .post(route)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      res.headers.should.have.property('x-access-token');
      DataStore.saveRequest('post', 'auth', route, payload);
      DataStore.saveResponse('post', 'auth', route, res.body);
      DataStore.userToken = res.headers['x-access-token'];
      done();
    });
};

const refresh = (done) => {
  const payload = {};
  const route = `/auth/refresh`;
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
      res.headers.should.have.property('x-access-token');
      DataStore.saveRequest('post', 'auth', route, payload);
      DataStore.saveResponse('post', 'auth', route, res.body);
      DataStore.userToken = res.headers['x-access-token'];
      done();
    });
};

module.exports = { login, refresh };