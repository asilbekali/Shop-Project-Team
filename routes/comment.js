const { Comment } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const commentValidator = require("../validators/comment.validator");

const router = require("express").Router();

/**
 * @swagger
 * /comment/product-comments/{id}:
 *   get:
 *     summary: Mahsulotga tegishli barcha izohlarni olish
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
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
 *         description: Mahsulotga tegishli barcha izohlar
 *       500:
 *         description: Izohlarni olishda xatolik yuz berdi
 */
router.get("/product-comments/:id", authMiddleware, async (req, res) => {
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
 * /comment:
 *   post:
 *     summary: Yangi izoh qoldirish
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               product_id:
 *                 type: integer
 *                 example: 5
 *               text:
 *                 type: string
 *                 example: "Bu mahsulot juda yaxshi!"
 *     responses:
 *       201:
 *         description: Izoh muvaffaqiyatli yaratildi
 *       400:
 *         description: Validatsiya xatosi
 *       500:
 *         description: Izoh qoldirishda xatolik yuz berdi
 */
router.post("/comment", authMiddleware, async (req, res) => {
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
 * /comment/{id}:
 *   patch:
 *     summary: Izohni yangilash
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Bu mahsulot juda ham yaxshi!"
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli yangilandi
 *       400:
 *         description: Bu izoh sizga tegishli emas
 *       404:
 *         description: Izoh topilmadi
 *       500:
 *         description: Izohni yangilashda xatolik yuz berdi
 */
router.patch("/comment/:id", authMiddleware, async (req, res) => {
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
 * /comment/{id}:
 *   delete:
 *     summary: Izohni o‘chirish
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli o‘chirildi
 *       400:
 *         description: Bu izoh sizga tegishli emas
 *       404:
 *         description: Izoh topilmadi
 *       500:
 *         description: Izohni o‘chirishda xatolik yuz berdi
 */
router.delete("/comment/:id", authMiddleware, async (req, res) => {
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
