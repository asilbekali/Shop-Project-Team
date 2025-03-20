const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const Order = require("../models/order");
const logger = require("../logger");
const orderValidator = require("../validators/order.validator");

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const myorder = await Order.findAll({ where: { user_id: req.user.id } });
    if (!myorder) return res.send({ message: "You don't have any order yet" });
    logger.log("info", "User used get method for my-orders");
    res.send(myorder);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to get my orders" });
  }
});

router.post("/order", authMiddleware, async (req, res) => {
  try {
    const { error } = orderValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const newOrder = await Order.create(req.body);
    logger.log("info", "User created new order");
    res.send(newOrder);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to post order" });
  }
});

router.patch("/order/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { error } = orderValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
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

router.delete("/order/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Order.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Order not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "You don't have access" });
    await one.destroy();
    logger.log("info", "Order deleted");
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to delete order" });
  }
});

module.exports = router;
