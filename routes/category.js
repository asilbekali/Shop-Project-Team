const { Category } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Router } = require("express");
const logger = require("../logger");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Kategoriya boshqarish API
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Yangi kategoriya yaratish
 *     tags: [Category]
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
 *                 example: "Fast Food"
 *     responses:
 *       201:
 *         description: Kategoriya muvaffaqiyatli yaratildi
 *       409:
 *         description: Ushbu kategoriya allaqachon mavjud
 *       500:
 *         description: Kategoriya yaratishda xatolik yuz berdi
 */
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

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: Barcha kategoriyalarni olish
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nechta element olish kerakligi
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Nechta elementdan keyin olish kerakligi
 *     responses:
 *       200:
 *         description: Kategoriyalar ro‘yxati
 *       500:
 *         description: Kategoriyalarni olishda xatolik yuz berdi
 */
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

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Kategoriyani yangilash
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategoriyaning ID-si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli yangilandi
 *       204:
 *         description: Kategoriya topilmadi
 *       500:
 *         description: Yangilash jarayonida xatolik yuz berdi
 */
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

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Kategoriyani o‘chirish
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chiriladigan kategoriyaning ID-si
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli o‘chirildi
 *       204:
 *         description: Kategoriya topilmadi
 *       500:
 *         description: O‘chirish jarayonida xatolik yuz berdi
 */
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
