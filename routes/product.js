const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const logger = require("../logger");
const { proValid } = require("../validators/product.validation");
const { Product, Comment } = require("../associations");

const router = Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin & Seller only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author_Id
 *               - name
 *               - description
 *               - price
 *               - category_Id
 *             properties:
 *               author_Id:
 *                 type: integer
 *                 description: ID of the product's author
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               category_Id:
 *                 type: integer
 *                 description: ID of the product's category
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Admin & Seller only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products (Paginated)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Returns a list of products
 *       500:
 *         description: Internal server error
 */
router.get("/all", authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /products/category/{id}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Returns a list of products in the category
 *       500:
 *         description: Internal server error
 */
router.get("/category/:id", authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product (Admin & Seller only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author_Id:
 *                 type: integer
 *                 description: ID of the product's author
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               category_Id:
 *                 type: integer
 *                 description: ID of the product's category
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
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
