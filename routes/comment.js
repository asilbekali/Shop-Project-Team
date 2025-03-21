/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing product comments
 */

/**
 * @swagger
 * /comments/product/{id}:
 *   get:
 *     summary: Get all comments for a specific product
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Error to get comments of product
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Error to post comment
 */

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error or unauthorized action
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error to patch comment
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment successfully deleted
 *       400:
 *         description: Unauthorized action
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error to delete comment
 */
const { Comment } = require("../associations");
const authMiddleware = require("../middlewares/authMiddleware");
const commentValidator = require("../validators/comment.validator");

const router = require("express").Router();


router.get("/product/:id", authMiddleware, async (req, res) => {
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


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    const newComment = await Comment.create(req.body);
    res.status(201).send(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to post comment" });
  }
});


router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    const { error } = commentValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    await one.update(req.body);
    res.send(one);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to patch comment" });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const one = await Comment.findByPk(req.params.id);
    if (!one) return res.status(404).send({ message: "Not found" });
    if (one.user_id != req.user.id)
      return res.status(400).send({ message: "It is not your comment" });
    await one.destroy();
    res.send({ message: "Comment successfully deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error to delete comment" });
  }
});

module.exports = router;
