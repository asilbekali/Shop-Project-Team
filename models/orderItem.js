const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const order_id = db.define("order_id", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  product_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  count: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey
        }
    }
);
  
module.exports = order_id;
