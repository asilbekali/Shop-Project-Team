const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "Token not provided" });
    const user = jwt.verify(token, "apex1");
    if (!user) return res.status(401).send({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
}

module.exports = authMiddleware;
