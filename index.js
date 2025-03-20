const express = require("express");
const { connectDb } = require("./config/db");
const regionRoute = require("./routes/region");
const authUserRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const commentRoute = require("./routes/comment");
const swaggerDocs = require("./swagger");
const multer = require("multer");
connectDb();

const app = express();
app.use(express.json());

app.use("/regions", regionRoute);
app.use("/auth", authUserRoute);
app.use("/categories", categoryRoute);
app.use("/products", productRoute);
app.use("/order", orderRoute);
app.use("/comments", commentRoute);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.fieldname);
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: "Image upload APIs"
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload an image
 *     description: Uploads a single image and returns its accessible URL.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rasm:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "http://localhost:3002/image/your_image.jpg"
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fayl yuklanmadi!"
 */
app.use("/uploads", upload.single("rasm"), (req, res) => {
  res.send({ url: `http://localhost:3002/image/${req.file.filename}` });
});

/**
 * @swagger
 * /image/{filename}:
 *   get:
 *     tags:
 *       - Upload
 *     summary: Get an uploaded image
 *     description: Serves a previously uploaded image by filename.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename of the image to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image not found"
 */
app.use("/image", express.static("uploads"));

swaggerDocs(app);

app.listen(3002, () => console.log("server is running on 3002"));
