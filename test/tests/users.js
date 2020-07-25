/* global describe, it */
const chai = require('chai');
const should = chai.should();
const { app } = require('../../src/index');
const DataStore = require('../datastore');
const agent = DataStore.agent;

const getUser = (done) => {
  const userId = DataStore.userId;
  const route = `/users/${userId}`;
  agent
    .get(route)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      res.body.data.should.have.property('id').eql(userId);
      DataStore.saveRequest('get', 'users', route);
      DataStore.saveResponse('get', 'users', route, res.body);
      done();
    });
};

const createUser = (done) => {
  const payload = {
    firstName: 'Bob',
    lastName: 'Dole',
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
      res.body.data.should.have.property('firstName').eql(payload.firstName);
      res.body.data.should.have.property('lastName').eql(payload.lastName);
      res.body.data.should.have.property('email').eql(payload.email);
      DataStore.saveRequest('post', 'users', route, payload);
      DataStore.saveResponse('post', 'users', route, res.body);
      DataStore.userId = res.body.data.id;
      done();
    });
};

const updateUser = (done) => {
  const userId = DataStore.userId;
  const payload = {
    firstName: 'Bill',
    lastName: 'Bobby',
  };
  const route = `/users`;
  agent
    .put(route)
    .send(payload)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      res.body.data.should.have.property('id').eql(userId);
      res.body.data.should.have.property('firstName').eql(payload.firstName);
      res.body.data.should.have.property('lastName').eql(payload.lastName);
      DataStore.saveRequest('put', 'users', route, payload);
      DataStore.saveResponse('put', 'users', route, res.body);
      done();
    });
};

module.exports = { getUser, createUser, updateUser };