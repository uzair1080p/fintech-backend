/* global describe, it */
const chai = require('chai');
const should = chai.should();
const { app } = require('../../src/index');
const DataStore = require('../datastore');
const agent = DataStore.agent;

const status = (done) => {
  const route = `/system/status`;
  agent
    .get(route)
    .end((err, res) => {
      should.not.exist(err);
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('success').eql(true);
      res.body.should.have.property('data').to.be.a('object');
      DataStore.saveRequest('get', 'system', route);
      DataStore.saveResponse('get', 'system', route, res.body);
      done();
    });
};

module.exports = { status };