const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");
const Spacecraft = sequelize.define("spacecraft", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nume: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3,225],
    },
  },
  viteza_maxima: {
    type: DataTypes.REAL,
    allowNull: false,
    validate: {
      min: 1001,
    },
  },
  masa: {
    type: DataTypes.REAL,
    allowNull: false,
    validate: {
      min: 201,
    },
  },
});

module.exports = Spacecraft;