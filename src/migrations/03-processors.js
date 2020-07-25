const Sequelize = require('sequelize');

const tableName = 'processors';

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