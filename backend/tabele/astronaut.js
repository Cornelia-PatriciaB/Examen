const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");
const Astronaut = sequelize.define("astronaut", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
          len: [5,225],
      },
    },
    rol: {
      type: DataTypes.ENUM({
        values: ['COMMANDER', 'PILOT']
      }),
      validate: {
        isIn: {
          args: [['COMMANDER', 'PILOT']],
            msg: "Avem un set limitat de roluri posibile: COMMANDER, PILOT."
        }
      }
    }
  });
  
  module.exports = Astronaut;