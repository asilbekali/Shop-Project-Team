const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const logger = require("../logger");
const { proValid } = require("../validators/product.validation");
const { Product } = require("../associations");
const Comment = require("../models/comment")

const router = Router();

router.post(
  "/product",
  roleMiddleware(["admin", "seller"]),
  async (req, res) => {
    try {
      const { error, value } = proValid(req.body);
      if (error) {
        console.log(error);
        logger.error("error in validation product");
        return res.status(500).send({ message: "Error in validation" });
      }
      console.log(value);

      const newPro = await Product.create({
        author_Id: value.author_Id,
        name: value.name,
        description: value.description,
        price: value.price,
        category_Id: value.category_Id,
      });
      logger.info("product createdd");
      res.send(newPro);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error in create product" });
      logger.error("Error in create product");
    }
  }
);

router.delete(
  "/product/:id",
  roleMiddleware(["admin", "seller"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const checkPro = await Product.findByPk(id);
      if (!checkPro) {
        logger.info("Product not found");
        return res.status(409).send("This product not found");
      }
      await checkPro.destroy();
      logger.info("deleted product");
      res.send({ message: "Product deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in delete product");
      logger.error("Error in delete product");
    }
  }
);

router.get("/products", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const allPro = await Product.findAll({
      limit,
      offset,
      include: { model: Comment },
    });
    res.send(allPro);
    logger.info("get products");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in get product");
    logger.error("Error in get product");
  }
});

router.get("/products-category/:id", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const allPro = await Product.findAll({
      where: { category_Id: req.params.id },
      limit,
      offset,
      include: { model: Comment },
    });
    res.send(allPro);
    logger.info("get products");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in get product");
    logger.error("Error in get product");
  }
});

router.patch(
  "/product/:id",
  roleMiddleware(["admin", "seller"]),
  async (req, res) => {
    const { id } = req.params;
    const { author_Id, name, description, price, category_Id } = req.body;
    try {
      const checkPro = await Product.findByPk(id);
      if (!checkPro) {
        logger.info("Product not found");
        return res.status(409).send("This product not found");
      }
      await checkPro.update({
        author_Id: author_Id || 1,
        name: name || "person name",
        description: description || "desc",
        price: price || 5200,
        category_Id: category_Id || 1,
      });
      logger.info("Product update");
      res.send(checkPro);
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in delete product");
      logger.error("Error in delete product");
    }
  }
);
module.exports = router;
