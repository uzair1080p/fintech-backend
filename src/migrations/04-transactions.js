const Sequelize = require('sequelize');

const tableName = 'transactions';

const fields = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  beforeFeeAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  currency: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: false,
    defaultValue: [],
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pending: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  userSelectedProcessor: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
};

const relations = {
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  accountId: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id',
    },
  },
  processorId: {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'processors',
      key: 'id',
    },
  },
};

const timestamps = {
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
};

const up = async (queryInterface) => {
  try {
    const definition = {...fields, ...relations, ...timestamps};
    await queryInterface.createTable(tableName, definition);
  } catch (err) {
    console.warn(err);
    process.exit(1);
  }
};

const down = async (queryInterface) => {
  try {
    await queryInterface.dropTable(tableName);
  } catch (err) {
    console.warn(err);
    process.exit(1);
  }
};

module.exports = {fields, relations, timestamps, up, down};