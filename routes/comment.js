const { Comment } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const commentValidator = require("../validators/comment.validator");

const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Foydalanuvchi sharhlarini boshqarish
 */

/**
 * @swagger
 * /comments/product/{id}:
 *   get:
 *     summary: Mahsulot sharhlarini olish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mahsulot ID-si
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nechta sharh olish kerak
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Nechta sharhni o'tkazib yuborish kerak
 *     responses:
 *       200:
 *         description: Sharhlar ro‘yxati
 *       500:
 *         description: Sharhlarni olishda xatolik
 */
router.get("/product/:id", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    let all = await Comment.findAll({
      where: { product_id: req.params.id },
      limit,
      offset,
    });
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to get comments of product" });
  }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Yangi sharh qo‘shish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *               content:
 *                 type: string
 *                 example: "Juda yaxshi mahsulot!"
 *     responses:
 *       201:
 *         description: Sharh muvaffaqiyatli qo‘shildi
 *       400:
 *         description: Validation xatosi
 *       500:
 *         description: Sharh qo‘shishda xatolik
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const newComment = await Comment.create(req.body);
    res.status(201).send(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to post comment" });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Foydalanuvchi sharhini yangilash
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sharh ID-si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Yangilangan sharh!"
 *     responses:
 *       200:
 *         description: Sharh muvaffaqiyatli yangilandi
 *       400:
 *         description: Sharh foydalanuvchiga tegishli emas
 *       404:
 *         description: Sharh topilmadi
 *       500:
 *         description: Sharh yangilashda xatolik
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    await one.update(req.body);
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to patch comment" });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Foydalanuvchi sharhini o‘chirish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chiriladigan sharhning ID-si
 *     responses:
 *       200:
 *         description: Sharh muvaffaqiyatli o‘chirildi
 *       400:
 *         description: Sharh foydalanuvchiga tegishli emas
 *       404:
 *         description: Sharh topilmadi
 *       500:
 *         description: Sharh o‘chirishda xatolik
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    await one.destroy();
    res.send({ message: "Comment successfully deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to delete comment" });
  }
});

module.exports = router;
