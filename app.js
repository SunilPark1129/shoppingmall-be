const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("joined be");

app.use("/api", indexRouter);

const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log("mongoose conntected"))
  .catch((err) => console.log("DB conntection fail", err));

app.listen(process.env.PORT || 5000, () => {
  console.log("server on");
});
