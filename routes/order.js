const express = require("express");
const User = require("../models/users");
const Order = require("../models/order");
const router = express.Router();

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["id", "userName", "email", "phone"] }, 
      ]
    }
  );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error:500 server error" });
    }
  }
);

router.post("/order", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: "Data entered uncorrectly" });
    }
  }
);

router.put("/order/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Order.update(req.body, { where: { id } });

    if (updated) {
      const updatedOrder = await Order.findByPk(id, {
        include: [
          { model: User, attributes: ["id", "userName", "email", "phone"] },
        ],
      }
    );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error:500 server error" });
    }
 }
);

router.delete("/order/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Buyurtma o‘chirildi" });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error:500 server error" });
    }
  }
);

module.exports = router;
