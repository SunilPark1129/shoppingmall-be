const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

// 카트에 아이템 생성하기
router.post("/", authController.authenticate, cartController.addItemToCart);

// 카트 리스트 가져오기
router.get("/", authController.authenticate, cartController.getCart);

// 카트 갯수 가져오기
router.get(
  "/getCartQty",
  authController.authenticate,
  cartController.getCartQty
);

// 카트 아이템 제거
router.delete(
  "/all",
  authController.authenticate,
  cartController.deleteCartAll
);
router.delete("/:id", authController.authenticate, cartController.deleteCart);

router.put(
  "/updateQty/:id",
  authController.authenticate,
  cartController.updateQty
);

module.exports = router;
