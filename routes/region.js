const { Region, User } = require("../associations");
const { Router } = require("express");
const { regionVali } = require("../validators/region.validation");
const logger = require("../logger");
const roleMiddleware = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

/**
 * @swagger
 * /regions:
 *   post:
 *     summary: Create a new region
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the region
 *     responses:
 *       201:
 *         description: Region created successfully
 *       409:
 *         description: Region must be unique
 *       500:
 *         description: Internal server error
 */
router.post("/", async (req, res) => {
  try {
    const { error, value } = regionVali(req.body);
    if (error) {
      return res.status(400).send({ message: "Error in validation region" });
    }

    const bazaRegion = await Region.findOne({ where: { name: value.name } });
    if (bazaRegion) {
      return res.status(409).send({ message: "Region must be unique!" });
    }

    const newRegion = await Region.create(value);
    logger.info("Region created", { region: newRegion });
    res.status(201).send(newRegion);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error in creating region" });
    logger.error("Error in creating region");
  }
});

/**
 * @swagger
 * /regions/all:
 *   get:
 *     summary: Get all regions (Paginated)
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of regions per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Returns a list of regions
 *       500:
 *         description: Internal server error
 */
router.get("/all", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;

    const bazaRegions = await Region.findAll({
      include: {
        model: User,
      },
      limit,
      offset,
    });

    logger.info("Fetched all regions");
    res.send(bazaRegions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching regions" });
    logger.error("Error in fetching regions");
  }
});

/**
 * @swagger
 * /regions/{id}:
 *   patch:
 *     summary: Update a region (Admin only)
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the region
 *     responses:
 *       200:
 *         description: Region updated successfully
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const bazaRegions = await Region.findByPk(id);
    if (!bazaRegions) {
      return res.status(404).send({ message: "Region not found!" });
    }

    await bazaRegions.update({ name: name || bazaRegions.name });
    logger.info("Region updated", { regionData: bazaRegions });
    res.send(bazaRegions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating region" });
    logger.error("Error in updating region");
  }
});

/**
 * @swagger
 * /regions/{id}:
 *   delete:
 *     summary: Delete a region (Admin only)
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region deleted successfully
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found!" });
    }

    await region.destroy();
    logger.info("Region deleted", { regionData: region });
    res.send({ message: "Region deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting region", error: error.message });
    logger.error("Error in deleting region");
  }
});

/**
 * @swagger
 * /regions/{id}:
 *   get:
 *     summary: Get a region by ID (Admin only)
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Returns a region object
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", roleMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const bazaRegions = await Region.findByPk(id);
    if (!bazaRegions) {
      return res.status(404).send({ message: "Region not found!" });
    }

    logger.info("Fetched region by ID", { regionData: bazaRegions });
    res.send(bazaRegions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching region" });
    logger.error("Error in fetching region");
  }
});

module.exports = router;
