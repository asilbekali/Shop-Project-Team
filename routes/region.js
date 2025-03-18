const { Region } = require("../associations");
const { Router } = require("express");
const { regionVali } = require("../validators/region.validation");

const router = Router();

router.post("/region", async (req, res) => {
  const { error, value } = regionVali(req.body);
  if (error) {
    return res.status(500).send({ message: "Error in validation region" });
  }
  const bazaRegion = await Region.findOne({ where: { name: value.name } });
  if (bazaRegion) {
    return res.status(409).send({ message: "Region must be uniqe !" });
  }
  const newRegion = await Region.create(value);
  res.send(newRegion);
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in create region" });
  }
});

router.get("/regions", async (req, res) => {
  try {
    const bazaRegions = await Region.findAll();
    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
  }
});

router.patch("/region/:id", async (req, res) => {
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

    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
  }
});

router.delete("/region/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found!" });
    }

    await region.destroy();
    res.send({ message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting region",
      error: error.message,
    });
  }
});

router.get("/region/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const bazaRegions = await Region.findByPk(id);
    res.send(bazaRegions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in show regions" });
  }
});

module.exports = router;
