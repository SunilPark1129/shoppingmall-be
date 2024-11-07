const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController = {};
const PAGE_SIZE = 10;

orderController.createOrder = async (req, res) => {
  try {
    // 프론트에서 받아오는 값들
    // userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList, sale } = req.body;

    // 재고 확인하기
    // 문제 있을시에 checkItemListStock에서 erorr를 throw함
    // 문제가 없다면 DB stock 값들을 유저가 재고를 선택한만큼 빼줌
    await productController.checkItemListStock(orderList);

    const orderNum = randomStringGenerator();

    // 새로운 오더 정리
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: orderNum,
      sale,
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
        select: "image name sale",
      },
    });
    const totalItemNum = await Order.find({ userId }).countDocuments();

    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    let { page, orderNum } = req.query;
    page = page || 1;

    // 몽구스만 사용하는 용도 $regex
    const cond = orderNum
      ? {
          orderNum: { $regex: orderNum, $options: "i" },
        }
      : {};

    const orderList = await Order.find(cond)
      .populate("userId")
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
          select: "image name",
        },
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const totalItemNum = await Order.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new Error("Order not found");

    next();
  } catch (error) {
    res.status(400).json({ status: "fail", data: error.message });
  }
};

module.exports = orderController;
