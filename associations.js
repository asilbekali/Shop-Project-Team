const User = require("./models/users");
const Region = require("./models/region");
const Comment = require("./models/comment");
const Order = require("./models/order");
const Product = require("./models/product");
const Category = require("./models/category");

User.belongsTo(Region, { foreignKey: "region_id" });
Region.hasMany(User, { foreignKey: "region_id" });

Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Comment.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Comment, {foreignKey: "product_id"})
Comment.belongsTo(Product, {foreignKey: "id"})

User.hasMany(Product, { foreignKey: "author_Id" });
Product.belongsTo(User, { foreignKey: "author_Id" });

Category.hasMany(Product, { foreignKey: "category_Id" });
Product.belongsTo(Category, { foreignKey: "category_Id" });

module.exports = { User, Region, Comment, Order, Product, Category };

