const { Region, User } = require("../associations");
const { Router } = require("express");
const { regionVali } = require("../validators/region.validation");
const logger = require("../logger");
const roleMiddleware = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.post("/region", roleMiddleware(["admin"]), async (req, res) => {
  const { error, value } = regionVali(req.body);
  if (error) {
    return res.status(500).send({ message: "Error in validation region" });
  }
  const bazaRegion = await Region.findOne({ where: { name: value.name } });
  if (bazaRegion) {
    return res.status(409).send({ message: "Region must be uniqe !" });
  }
  const newRegion = await Region.create(value);
  logger.info("region created", { region: newRegion });
  res.send(newRegion);
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in create region" });
    logger.error("Error in created region");
  }
});

router.get("/regions", authMiddleware, async (req, res) => {
  try {
    const bazaRegions = await Region.findAll({
      include: {
        model: User,
      },
    });
    logger.info("region get  method");
    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
    logger.error("Error in region get");
  }
});

router.patch("/region/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const bazaRegions = await Region.findByPk(id);
    if (!bazaRegions) {
      return res.status(404).send({ message: "Region nor found !" });
    }

    await bazaRegions.update({
      name: name || bazaRegions.name,
    });
    logger.info("Region updated", { regionData: bazaRegions });
    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
    logger.error("Error in region updated");
  }
});

router.delete("/region/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found!" });
    }
    logger.info("Region deleted", { regionData: region });
    await region.destroy();
    res.send({ message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting region",
      error: error.message,
    });
    logger.error("Error in Region deleted");
  }
});

router.get("/region/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const bazaRegions = await Region.findByPk(id);
    logger.info("Get region with id", { regionData: bazaRegions });
    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
    logger.error("Error in get region with id");
  }
});

module.exports = router;
