const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const Order = db.define("Order", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  }});
  
module.exports = Order;
