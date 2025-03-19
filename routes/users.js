const router = require("express").Router();
const logger = require("../logger");
const roleMiddleware = require("../middlewares/roleMiddleware");
const bcrypt = require("bcrypt");
const userValidator = require("../validators/user.validator");
const { Region, User } = require("../associations");

router.get("/all", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const all = await User.findAll({
      include: { model: Region },
      limit,
      offset,
    });
    logger.log("info", "Admin used get mothod for Users");
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in getting users" });
  }
});

router.get("/byregion/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const all = await User.findAll({
      where: { region_id: req.params.id },
      include: { model: Region },
      limit,
      offset,
    });
    if (!all) return res.status(404).send({ message: "Users not found" });
    logger.log("info", "Admin used get mothod for Users by regionId");
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in getting users by regionId" });
  }
});

router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { error } = userValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const { password, ...rest } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      password: hash,
      ...rest,
      status: "active",
    });
    logger.log("info", "Admin created new User");
    res.send(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in posting user" });
  }
});

router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send({ message: "User not found" });
    await user.update(req.body);
    logger.log("info", `Admin patched User - userId: ${req.params.id}`);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in patching user" });
  }
});

router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send({ message: "User not found" });
    await user.destroy();
    logger.log("info", `Admin deleted User - userId: ${req.params.id}`);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in deleting user" });
  }
});

module.exports = router;
