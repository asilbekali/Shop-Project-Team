/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * /my-orders:
 *   get:
 *     summary: Get all orders of the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   OrderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         product_id:
 *                           type: integer
 *                         count:
 *                           type: integer
 *                         Product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *                             img:
 *                               type: string
 *       404:
 *         description: No orders found
 *       500:
 *         description: Error fetching orders
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new order
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
 *               count:
 *                 type: integer
 *             required:
 *               - product_id
 *               - count
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Error creating order
 */

/**
 * @swagger
 * /{id}:
 *   patch:
 *     summary: Update an order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error updating order
 */

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete an order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error deleting order
 */
const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Order, OrderItem, Product } = require("../associations");
const logger = require("../logger");
const orderValidator = require("../validators/order.validator");


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
