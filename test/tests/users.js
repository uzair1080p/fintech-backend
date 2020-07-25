/* global describe, it */
const chai = require('chai');
const should = chai.should();
const { app } = require('../../src/index');
const DataStore = require('../datastore');
const agent = DataStore.agent;

const createUser = (done) => {
  const payload = {
    name: 'Bob Dole',
    email: 'bob@dole.com',
    password: 'ilikeapples12'
  };
  const route = `/users`;
  agent
    .post(route)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      res.body.data.should.have.property('id');
      res.body.data.should.have.property('name').eql(payload.name);
      res.body.data.should.have.property('email').eql(payload.email);
      res.headers.should.have.property('x-access-token');
      DataStore.saveRequest('post', 'users', route, payload);
      DataStore.saveResponse('post', 'users', route, res.body);
      DataStore.userId = res.body.data.id;
      DataStore.userToken = res.headers['x-access-token'];
      done();
    });
};

const updateUser = (done) => {
  const userId = DataStore.userId;
  const payload = {
    name: 'Bill Bobby'
  };
  const route = `/users`;
  agent
    .put(route)
    .set('authorization', DataStore.userToken)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      res.body.data.should.have.property('id').eql(userId);
      res.body.data.should.have.property('name').eql(payload.name);
      DataStore.saveRequest('put', 'users', route, payload);
      DataStore.saveResponse('put', 'users', route, res.body);
      done();
    });
};

module.exports = { createUser, updateUser };