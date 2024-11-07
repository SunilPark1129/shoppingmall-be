const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://shoppingmall-spark.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", indexRouter);

const mongoURI = process.env.LOCAL_DB_ADDRESS || process.env.MONGODB_URI_PROD;
mongoose
  .connect(mongoURI)
  .then(() => console.log("mongoose conntected"))
  .catch((err) => console.log("DB conntection fail", err));

app.listen(process.env.PORT || 5000, () => {
  console.log("server on");
});
