const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./sqlite/examen.db",
  define: {
    timestamps: false,
  },
});
sequelize.sync({alter: true}).then(() => {
  console.log("Toate modelele au fost sincronizate cu succes!");
});

module.exports = sequelize;