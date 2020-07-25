const Sequelize = require("sequelize");

const tableName = "processors";

const fields = {
  matchString: {
    type: Sequelize.STRING,
    allowNull: true,
  },
};

const relations = {};

const timestamps = {};

const up = async (queryInterface) => {
  try {
    await queryInterface.addColumn(
      tableName,
      "matchString",
      fields.matchString
    );
  } catch (err) {
    console.warn(err);
    process.exit(1);
  }
};

const down = async (queryInterface) => {
  try {
    await queryInterface.removeColumn(tableName, "matchString");
  } catch (err) {
    console.warn(err);
    process.exit(1);
  }
};

module.exports = { fields, relations, timestamps, up, down };
