const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    console.log("start");
    // 프론트에서 받아오는 값들
    // userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    console.log(userId);

    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    // 재고가 충분하지 않는 아이템이 존재한다면 => 에러 반환
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const orderNum = randomStringGenerator();

    // 새로운 오더 정리
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: orderNum,
    });
    await newOrder.save();
    console.log(newOrder);
    res.status(200).json({ status: "success", orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = orderController;
