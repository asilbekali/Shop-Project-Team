const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "Token not provided" });
    const user = jwt.verify(token, "apex1");
    if (!user) return res.status(401).send({ message: "Invalid token" });
    console.log();
    
    if (user.status != "active")
      return res
        .status(401)
        .send({ message: "You did not verified please verify your account" });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
}

module.exports = authMiddleware;
