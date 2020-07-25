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
      DataStore.saveRequest('post', 'auth', route, payload);
      DataStore.saveResponse('post', 'auth', route, res.body);
      done();
    });
};

const refresh = (done) => {
  const payload = {};
  const route = `/auth/refresh`;
  agent
    .post(route)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('post', 'auth', route, payload);
      DataStore.saveResponse('post', 'auth', route, res.body);
      done();
    });
};

const logout = (done) => {
  const payload = {};
  const route = `/auth/logout`;
  agent
    .post(route)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('post', 'auth', route, payload);
      DataStore.saveResponse('post', 'auth', route, res.body);
      done();
    });
};

module.exports = { login, refresh, logout };