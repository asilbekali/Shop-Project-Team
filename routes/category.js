const Category = require("../models/category");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const { Router } = require("express");
const logger = require("../logger");

const router = Router();

router.post("/category", roleMiddleware(["admin"]), async (req, res) => {
  const { name } = req.body;
  try {
    const bazaCategory = await Category.findOne({ where: { name: name } });
    if (bazaCategory) {
      return res.status(409).send({ message: "This category already created" });
    }
    const newCategory = await Category.create({ name: name });
    logger.info("Category created");
    res.send(newCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in create category" });
    logger.error("Error in  cagetgory create");
  }
});

router.get("/categories", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    const all = await Category.findAll({
      limit,
      offset,
    });
    logger.info("categorys get all");
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in get categorys" });
    logger.error("Error in get categorys");
  }
});

router.patch("/category/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const bazaCategory = await Category.findByPk(id);
    if (!bazaCategory) {
      return res.status(204).send("Categorys empty !");
    }
    logger.info("Category updated");
    await bazaCategory.update({ name });
    res.send(bazaCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in updated category" });
    logger.error("Error in category updated");
  }
});

router.delete("/category/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const bazaCategory = await Category.findByPk(id);
    if (!bazaCategory) {
      return res.status(204).send("Categorys empty !");
    }
    logger.info("Category deleted");
    await bazaCategory.destroy();
    res.send({ message: "Category successfully deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in delete category" });
    logger.error("Error in category delete");
  }
});

module.exports = router;
