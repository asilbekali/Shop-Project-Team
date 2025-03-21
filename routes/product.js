/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/category/{id}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const logger = require("../logger");
const { proValid } = require("../validators/product.validation");
const { Product, Comment } = require("../associations");

const router = Router();

router.post("/", roleMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { error, value } = proValid(req.body);
    if (error) {
      console.log(error);
      logger.error("Error in product validation");
      return res.status(400).send({ message: "Error in validation" });
    }

    const newPro = await Product.create(value);
    logger.info("Product created");
    res.status(201).send(newPro);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating product" });
    logger.error("Error creating product");
  }
});

router.delete("/:id", roleMiddleware(["admin", "seller"]), async (req, res) => {
  const { id } = req.params;
  try {
    const checkPro = await Product.findByPk(id);
    if (!checkPro) {
      logger.info("Product not found");
      return res.status(404).send({ message: "This product not found" });
    }
    await checkPro.destroy();
    logger.info("Deleted product");
    res.send({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product");
    logger.error("Error deleting product");
  }
});

router.get("/all", async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    const allPro = await Product.findAll({
      limit,
      offset,
      include: { model: Comment },
    });

    logger.info("Fetched all products");
    res.send(allPro);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching products");
    logger.error("Error fetching products");
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    const allPro = await Product.findAll({
      where: { category_Id: req.params.id },
      limit,
      offset,
      include: { model: Comment },
    });

    logger.info("Fetched products by category");
    res.send(allPro);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching products by category");
    logger.error("Error fetching products by category");
  }
});

router.patch("/:id", roleMiddleware(["admin", "seller"]), async (req, res) => {
  const { id } = req.params;
  try {
    const checkPro = await Product.findByPk(id);
    if (!checkPro) {
      logger.info("Product not found");
      return res.status(404).send({ message: "This product not found" });
    }
    await checkPro.update(req.body);
    logger.info("Product updated");
    res.send(checkPro);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating product");
    logger.error("Error updating product");
  }
});

module.exports = router;
