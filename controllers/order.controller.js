const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};
const PAGE_SIZE = 8;

orderController.createOrder = async (req, res) => {
  try {
    // 프론트에서 받아오는 값들
    // userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

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
    res.status(200).json({ status: "success", orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;

    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "image name",
      },
    });
    const totalItemNum = await Order.find({ userId }).countDocuments();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    console.log("start");

    console.log(totalPageNum);
    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.findOne({ userId });

    if (!orderList) throw new Error("주문하신 오더가 없습니다");

    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = orderController;
