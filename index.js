const express = require("express");
const { connectDb } = require("./config/db");
const regionRoute = require("./routes/region");
const app = express();
app.use(express.json());
app.use(regionRoute);
connectDb();

app.listen(3002, () => console.log("server is running on 3001"));


<<<<<<< HEAD
=======
console.log("ishladi kod");
>>>>>>> asilbek
