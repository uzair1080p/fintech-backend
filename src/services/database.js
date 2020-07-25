const { ENV, DATABASE_URL } = require('../config');
const Sequelize = require('sequelize');
const Serializer = require('sequelize-to-json');

const Database = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: ENV === 'production' },
  typeValidation: true,
  logging: null,
  define: { underscored: false },
  operatorsAliases: false,
});

function serialize(schema) {
  return (new Serializer(this.constructor, schema || this.constructor.serializerSchema)).serialize(this);
}

function serializeMany(data, schema) {
  return Serializer.serializeMany(data, this, schema || this.serializerSchema);
}

module.exports = { Database, Sequelize, serialize, serializeMany };
