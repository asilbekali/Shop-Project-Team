const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { Order, OrderItem } = require("../associations");
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
              model: Products,
              attributes: ["id", "name", "price", "image"],
            },
          ],
        },
      ],
    });
    if (!myorders) return res.send({ message: "You don't have any order" });
    logger.log("info", "User used get method for my-orders");
    res.send(myorders);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to get my orders" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = orderValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { product_id, count } = req.body;
    const order = await Order({ user_id: req.user.id });

    for (i of product_id) {
      await OrderItem.create({ order_id: order.id, product_id: i, count });
    }
    logger.log("info", "User created new order");
    res.send({ message: "Order created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to post order" });
  }
});

router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const one = await Order.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Order not found" });
    await one.update(req.body);
    logger.log("info", "Admin patched order");
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to patch order" });
  }
});

router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const one = await Order.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Order not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "You don't have access" });
    await one.destroy();
    logger.log("info", "Admin deleted order");
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to delete order" });
  }
});

module.exports = router;
