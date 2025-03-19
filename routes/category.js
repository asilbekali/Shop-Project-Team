const Category = require("../models/category");

const { Router } = require("express");
const logger = require("../logger");

const router = Router();

router.post("/category", async (req, res) => {
    const { name } = req.body;
    try {
        const bazaCategory = await Category.findOne({ where: { name: name } });
        if (bazaCategory) {
            return res
                .status(409)
                .send({ message: "This category already created" });
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

router.get("/categorys", async (req, res) => {
    try {
        const bazaCategory = await Category.findAll();
        if (!bazaCategory) {
            return res.status(204).send("Categorys empty !");
        }
        logger.info("categorys get all");
        res.send(bazaCategory);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in get categorys" });
        logger.error("Error in get categorys");
    }
});

router.patch("/category/:id", async (req, res) => {
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

router.delete("/category/:id", async (req, res) => {
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

router.get("/page/category", async (req, res) => {
    try {
        let { limit, offset } = req.query; 
        limit = parseInt(limit) || 10;
        offset = (parseInt(offset) - 1) * limit || 0;

        const all = await Category.findAll({
            limit,
            offset,
        });

        logger.log("info", "Category pagination get");
        res.send(all);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in category pagination" });
        logger.error("Error in category pagination");
    }
});


module.exports = router;
