const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const OrderItem = db.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = OrderItem;
