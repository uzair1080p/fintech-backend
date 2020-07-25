const {
  Sequelize,
  Database,
  serialize,
  serializeMany,
} = require("../services/database");
const { NotFoundError } = require("../services/errors");
const _ = require("lodash");

const fields = {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  percentFee: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  color: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  matchString: {
    type: Sequelize.STRING,
    allowNull: true,
  },
};

const relations = {
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
};

const timestamps = {
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("NOW"),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("NOW"),
  },
  deletedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
};

const Processor = Database.define("processor", fields, { paranoid: true });

Processor.serialize = serializeMany;
Processor.prototype.serialize = serialize;
Processor.serializerSchema = {
  include: ["@all"],
  exclude: ["deletedAt"],
};

const ALLOWED_CREATE_FIELDS = ["name", "percentFee", "color"];
const ALLOWED_UPDATE_FIELDS = ["name", "percentFee", "color"];

Processor.findByProcessorId = async function (processorId, userId) {
  try {
    const query = { where: { id: processorId, userId }, rejectOnEmpty: true };
    return await this.findOne(query);
  } catch (err) {
    throw NotFoundError;
  }
};

Processor.getProcessorList = async function (userId) {
  const query = { where: { userId } };
  return this.findAll(query);
};

Processor.createProcessor = async function (userId, body) {
  const fields = _.pick(body, ALLOWED_CREATE_FIELDS);
  fields.userId = userId;
  return this.create(fields);
};

Processor.prototype.updateProcessor = async function (body) {
  const fields = _.pick(body, ALLOWED_UPDATE_FIELDS);
  Object.keys(fields).forEach((v) => this.set(v, fields[v]));
  return this.save();
};

Processor.removeProcessor = async function (processorId, userId) {
  return this.destroy({ where: { id: processorId, userId } });
};

module.exports = Processor;
