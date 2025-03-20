const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Order, OrderItem, Product } = require("../associations");
const logger = require("../logger");
const orderValidator = require("../validators/order.validator");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Buyurtmalarni boshqarish
 */

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Foydalanuvchining barcha buyurtmalarini olish
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buyurtmalar ro‘yxati
 *       404:
 *         description: Foydalanuvchi buyurtmalari mavjud emas
 *       500:
 *         description: Buyurtmalarni olishda xatolik
 */
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const myorders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "img"],
            },
          ],
        },
      ],
    });

    if (!myorders || myorders.length === 0)
      return res.send({ message: "You don't have any orders" });

    logger.log("info", "User fetched their orders");
    res.send(myorders);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching orders" });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Yangi buyurtma yaratish
 *     tags: [Orders]
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
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               count:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Buyurtma muvaffaqiyatli yaratildi
 *       400:
 *         description: Yaroqsiz ma’lumot
 *       500:
 *         description: Buyurtma yaratishda xatolik
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = orderValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { product_id, count } = req.body;
    const order = await Order.create({ user_id: req.user.id });

    for (const i of product_id) {
      await OrderItem.create({ order_id: order.id, product_id: i, count });
    }

    logger.log("info", `User ${req.user.id} created new order`);
    res.status(201).send({ message: "Order created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating order" });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: Buyurtmani yangilash (faqat admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Yangilanishi kerak bo'lgan buyurtma ID-si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Delivered"
 *     responses:
 *       200:
 *         description: Buyurtma muvaffaqiyatli yangilandi
 *       404:
 *         description: Buyurtma topilmadi
 *       500:
 *         description: Buyurtmani yangilashda xatolik
 */
router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const one = await Order.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Order not found" });

    await one.update(req.body);

    logger.log("info", `Admin updated order ${req.params.id}`);
    res.send(one);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating order" });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Buyurtmani o‘chirish (faqat admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chirilishi kerak bo'lgan buyurtma ID-si
 *     responses:
 *       200:
 *         description: Buyurtma muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Buyurtma topilmadi
 *       500:
 *         description: Buyurtmani o‘chirishda xatolik
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const one = await Order.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Order not found" });

    await one.destroy();

    logger.log("info", `Admin deleted order ${req.params.id}`);
    res.send({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error deleting order" });
  }
});

module.exports = router;
