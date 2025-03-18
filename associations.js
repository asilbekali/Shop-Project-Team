const User = require("./models/users");
const Region = require("./models/region");

User.belongsTo(Region, { foreignKey: "region_id" });
Region.hasMany(User, { foreignKey: "region_id" });

module.exports = { User, Region };
