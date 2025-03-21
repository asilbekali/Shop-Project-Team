const { Sequelize } = require("sequelize");

const db = new Sequelize("n17", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

async function connectDb() {
  try {
    await db.authenticate();
    console.log("db connected");
    // await db.sync({ force: true });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { db, connectDb };
