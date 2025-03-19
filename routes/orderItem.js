const express = require("express");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const OrderItem = require("../models/OrderItem");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get("/", async (req, res) => {
    try {
        const orderItems = await OrderItem.find();
        res.json(orderItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", 
    param("id").isMongoId().withMessage("Invalid ID format"),
    validateRequest,
    async (req, res) => {
        try {
            const orderItem = await OrderItem.findById(req.params.id);
            if (!orderItem) return res.status(404).json({ message: "Order item not found" });
            res.json(orderItem);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

router.post("/", [
    body("order_id").isMongoId().withMessage("Invalid order_id format"),
    body("product_id").isMongoId().withMessage("Invalid product_id format"),
    body("count").isInt({ min: 1 }).withMessage("Count must be at least 1"),
    validateRequest
], async (req, res) => {
    const orderItem = new OrderItem({
        order_id: req.body.order_id,
        product_id: req.body.product_id,
        count: req.body.count
    });

    try {
        const newOrderItem = await orderItem.save();
        res.status(201).json(newOrderItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/:id", [
    param("id").isMongoId().withMessage("Invalid ID format"),
    body("count").optional().isInt({ min: 1 }).withMessage("Count must be at least 1"),
    validateRequest
], async (req, res) => {
    try {
        const updatedOrderItem = await OrderItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrderItem) return res.status(404).json({ message: "Order item not found" });
        res.json(updatedOrderItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/:id", 
    param("id").isMongoId().withMessage("Invalid ID format"),
    validateRequest,
    async (req, res) => {
        try {
            const deletedOrderItem = await OrderItem.findByIdAndDelete(req.params.id);
            if (!deletedOrderItem) return res.status(404).json({ message: "Order item not found" });
            res.json({ message: "Order item deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

module.exports = router;
