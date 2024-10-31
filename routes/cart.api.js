const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cartController");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);

module.exports = router;
