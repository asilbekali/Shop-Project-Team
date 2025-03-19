const express = require("express");
const { connectDb } = require("./config/db");
const regionRoute = require("./routes/region");
const authUserRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const proRoute = require("./routes/product");
const app = express();
app.use(express.json());
app.use(regionRoute);
app.use(authUserRoute);
app.use(categoryRoute);
app.use(proRoute);
connectDb();

app.listen(3002, () => console.log("server is running on 3001"));
