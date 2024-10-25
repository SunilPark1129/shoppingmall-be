const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
