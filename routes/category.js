const { Category } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const { Router } = require("express");
const logger = require("../logger");

const router = Router();

/**
 * @swagger
 * /category:
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
 *         description: Bu kategoriya allaqachon mavjud
 *       500:
 *         description: Kategoriya yaratishda xatolik yuz berdi
 */
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  const { name } = req.body;
  try {
    const bazaCategory = await Category.findOne({ where: { name: name } });
    if (bazaCategory) {
      return res.status(409).send({ message: "This category already created" });
    }
    const newCategory = await Category.create({ name: name });
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
 * /category/all:
 *   get:
 *     summary: Barcha kategoriyalarni olish
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Barcha kategoriyalar ro'yxati
 *       500:
 *         description: Kategoriyalarni olishda xatolik yuz berdi
 */
router.get("/all", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const all = await Category.findAll({
      limit,
      offset,
    });
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
 * /category/{id}:
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
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Drinks"
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli yangilandi
 *       204:
 *         description: Kategoriya topilmadi
 *       500:
 *         description: Kategoriya yangilashda xatolik yuz berdi
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
 * /category/{id}:
 *   delete:
 *     summary: Kategoriyani o'chirish
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli o'chirildi
 *       204:
 *         description: Kategoriya topilmadi
 *       500:
 *         description: Kategoriya o‘chirishda xatolik yuz berdi
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
