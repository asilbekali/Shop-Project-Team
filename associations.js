const User = require("./models/users");
const Region = require("./models/region");
const Comment = require("./models/comment");
const Order = require("./models/order");
const Product = require("./models/product");
const Category = require("./models/category");

User.belongsTo(Region, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Region.hasMany(User, {
  foreignKey: "region_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Comment, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Order, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Order.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Comment.belongsTo(Product, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.hasMany(Comment, {
  foreignKey: "product_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(Product, {
  foreignKey: "author_Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.belongsTo(User, {
  foreignKey: "author_Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Category.hasMany(Product, {
  foreignKey: "category_Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.belongsTo(Category, {
  foreignKey: "category_Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = { User, Region, Comment, Order, Product, Category };
