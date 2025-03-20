const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const logger = require("../logger");
const { proValid } = require("../validators/product.validation");
const { Product, Comment } = require("../associations");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Mahsulotlarni boshqarish
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Yangi mahsulot qo‘shish
 *     tags: [Products]
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
 *                 example: "Osh"
 *               price:
 *                 type: number
 *                 example: 50000
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               category_Id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Mahsulot muvaffaqiyatli yaratildi
 *       400:
 *         description: Yaroqsiz ma’lumot
 *       500:
 *         description: Mahsulot yaratishda xatolik
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
 *     summary: Mahsulotni o‘chirish (faqat admin yoki seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chiriladigan mahsulot ID-si
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Mahsulot topilmadi
 *       500:
 *         description: Mahsulotni o‘chirishda xatolik
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
 *     summary: Barcha mahsulotlarni olish
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nechta mahsulot olish kerakligini belgilaydi
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Nechta mahsulotdan keyin boshlash kerakligi
 *     responses:
 *       200:
 *         description: Barcha mahsulotlar
 *       500:
 *         description: Mahsulotlarni olishda xatolik
 */
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

/**
 * @swagger
 * /products/category/{id}:
 *   get:
 *     summary: Kategoriya bo‘yicha mahsulotlarni olish
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategoriya ID-si
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nechta mahsulot olish kerakligini belgilaydi
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Nechta mahsulotdan keyin boshlash kerakligi
 *     responses:
 *       200:
 *         description: Kategoriya bo‘yicha mahsulotlar
 *       500:
 *         description: Mahsulotlarni olishda xatolik
 */
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

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Mahsulotni yangilash (faqat admin yoki seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Yangilanishi kerak bo'lgan mahsulot ID-si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Osh"
 *               price:
 *                 type: number
 *                 example: 55000
 *               image:
 *                 type: string
 *                 example: "https://example.com/new-image.jpg"
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli yangilandi
 *       404:
 *         description: Mahsulot topilmadi
 *       500:
 *         description: Mahsulotni yangilashda xatolik
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
