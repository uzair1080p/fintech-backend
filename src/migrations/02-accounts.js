const Sequelize = require('sequelize');

const tableName = 'accounts';

const fields = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  institutionId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last4: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  accessToken: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  plaidItemId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  publicToken: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
  },
  averageFeePercent: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalFees: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalIncome: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '-',
  },
  numTransactions: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  institutionColor: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
  institutionLogo: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
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
  deletedAt: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
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