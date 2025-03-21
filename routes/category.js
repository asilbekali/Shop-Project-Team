/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the category
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       409:
 *         description: This category already exists
 *       500:
 *         description: Error in creating category
 */

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: Get all categories with pagination
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of categories to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number to fetch
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Error in fetching categories
 */

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the category
 *                 example: Home Appliances
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       204:
 *         description: Category not found
 *       500:
 *         description: Error in updating category
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the category to delete
 *     responses:
 *       200:
 *         description: Category successfully deleted
 *       204:
 *         description: Category not found
 *       500:
 *         description: Error in deleting category
 */
const { Category } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Router } = require("express");
const logger = require("../logger");

const router = Router();


router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  const { name } = req.body;
  try {
    const bazaCategory = await Category.findOne({ where: { name } });
    if (bazaCategory) {
      return res.status(409).send({ message: "This category already created" });
    }
    const newCategory = await Category.create({ name });
    logger.info("Category created");
    res.status(201).send(newCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in create category" });
    logger.error("Error in category create");
  }
});

router.get("/all", async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const all = await Category.findAll({ limit, offset });
    logger.info("Categories fetched");
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in get categories" });
    logger.error("Error in get categories");
  }
});

router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const bazaCategory = await Category.findByPk(id);
    if (!bazaCategory) {
      return res.status(204).send("Categories empty !");
    }
    logger.info("Category updated");
    await bazaCategory.update({ name });
    res.send(bazaCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in updated category" });
    logger.error("Error in category updated");
  }
});

router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const bazaCategory = await Category.findByPk(id);
    if (!bazaCategory) {
      return res.status(204).send("Categories empty !");
    }
    logger.info("Category deleted");
    await bazaCategory.destroy();
    res.send({ message: "Category successfully deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in delete category" });
    logger.error("Error in category delete");
  }
});

module.exports = router;
