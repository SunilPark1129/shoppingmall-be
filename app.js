const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
const corsOptions = {
  origin: "http://localhost:3000", // 허용할 클라이언트 URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 허용할 HTTP 메서드
  allowedHeaders: ["Content-Type", "Authorization"], // 허용할 헤더
};
app.use(cors(corsOptions));
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
