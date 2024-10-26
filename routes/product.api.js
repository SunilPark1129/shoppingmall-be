const express = require("express");
const productController = require("../controllers/product.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

module.exports = router;
