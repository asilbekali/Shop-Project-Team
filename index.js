const express = require("express");
const { connectDb } = require("./config/db");
const regionRoute = require("./routes/region");
const authUserRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const multer = require("multer");
connectDb();

const app = express();
app.use(express.json());

app.use(regionRoute);
app.use(authUserRoute);
app.use(categoryRoute);
app.use(productRoute);
app.use(orderRoute);

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

app.use("/uploads", upload.single("rasm"), (req, res) => {
  res.send({ url: `http://localhost:3002/image/${req.file.filename}` });
});

app.use("/image", express.static("uploads"));

app.listen(3002, () => console.log("server is running on 3002"));
