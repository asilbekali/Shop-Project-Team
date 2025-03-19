const { Comment } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const commentValidator = require("../validators/comment.validator");

const router = require("express").Router();

router.get("/product-comments/:id", authMiddleware, async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = (parseInt(offset) - 1) * limit || 0;
    let all = await Comment.findAll({
      where: { product_id: req.params.id },
      limit,
      offset,
    });
    res.send(all);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to get comments of product" });
  }
});

router.post("/comment", authMiddleware, async (req, res) => {
  try {
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const newComment = await Comment.create(req.body);
    res.send(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to post comment" });
  }
});

router.patch("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    if (!one) return res.status(404).send({ message: "Not found" });
    await one.update(req.body);
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to patch comment" });
  }
});

router.delete("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    if (!one) return res.status(404).send({ message: "Not found" });
    await one.delete();
    res.send(one.dataValues);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to delete comment" });
  }
});

module.exports = router;
