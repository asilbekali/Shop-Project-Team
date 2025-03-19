const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const logger = require("../logger");
const { proValid } = require("../validators/product.validation");
const User = require("../models/users");
const upload = require("../multer/malter");

const router = Router();

router.post(
    "/product",
    roleMiddleware(["admin", "seller"]),
    async (req, res) => {
        try {
            const { error, value } = proValid(req.body);
            if (error) {
                logger.error("error in validation product");
                return res.status(500).send({ message: "Error in validation" });
            }

            const authorIdBaza = await User.findByPk(value.author_Id);

            res.send(authorIdBaza);
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Error in create product" });
            logger.error("Error in create product");
        }
    }
);

module.exports = router;
