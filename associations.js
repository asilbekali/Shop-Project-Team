const User = require("./models/users");
const Region = require("./models/region");
const Comment = require("./models/comment");

User.belongsTo(Region, { foreignKey: "region_id" });
Region.hasMany(User, { foreignKey: "region_id" });

Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });

module.exports = { User, Region, Comment };
