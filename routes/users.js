const router = require("express").Router();
const logger = require("../logger");
const roleMiddleware = require("../middlewares/roleMiddleware");
const bcrypt = require("bcrypt");
const userValidator = require("../validators/user.validator");
const { Region, User } = require("../associations");

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Returns a list of users
 *       500:
 *         description: Internal server error
 */
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

    logger.info("Admin fetched all users");
    res.send(all);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in getting users" });
    logger.error("Error in getting users", { error });
  }
});

/**
 * @swagger
 * /users/byregion/{id}:
 *   get:
 *     summary: Get users by region (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Returns a list of users by region
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get("/byregion/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    const users = await User.findAll({
      where: { region_id: req.params.id },
      include: { model: Region },
      limit,
      offset,
    });

    if (!users.length) {
      return res.status(404).send({ message: "Users not found" });
    }

    logger.info("Admin fetched users by region", { regionId: req.params.id });
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in getting users by region" });
    logger.error("Error in getting users by region", { error });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               region_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { error } = userValidator.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { password, ...rest } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      password: hash,
      ...rest,
      status: "active",
    });

    logger.info("Admin created a new user", { userId: newUser.id });
    res.status(201).send(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in creating user" });
    logger.error("Error in creating user", { error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    await user.update(req.body);
    logger.info("Admin updated a user", { userId: req.params.id });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in updating user" });
    logger.error("Error in updating user", { error });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    await user.destroy();
    logger.info("Admin deleted a user", { userId: req.params.id });
    res.send({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in deleting user" });
    logger.error("Error in deleting user", { error });
  }
});

module.exports = router;
