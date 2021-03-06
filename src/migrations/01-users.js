const Sequelize = require('sequelize');

const tableName = 'users';

const fields = {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  onBoarding: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
};

const relations = {

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