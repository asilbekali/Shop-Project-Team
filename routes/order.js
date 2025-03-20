const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Order, OrderItem, Product } = require("../associations");
const logger = require("../logger");
const orderValidator = require("../validators/order.validator");

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get the authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the list of orders
 *       500:
 *         description: Internal server error
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
              attributes: ["id", "name", "price", "image"],
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
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - count
 *             properties:
 *               product_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of product IDs
 *               count:
 *                 type: integer
 *                 description: Quantity of each product
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
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
 *     summary: Update an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
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
 *                 description: Updated status of the order
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
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
 *     summary: Delete an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
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
 *       400:
 *         description: Access denied
 *       500:
 *         description: Internal server error
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
