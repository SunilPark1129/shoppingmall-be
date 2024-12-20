const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들기
      cart = new Cart({ userId });
      await cart.save();
    }

    // 이미 카트에 들어가있는 아이템이냐? - productId와 size 둘다 확인해야된다
    // ** equals를 사용한 이유는 mongoose.ObjectId 타입이기 때문
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    // 그렇다면 에러
    if (existItem) throw new Error("The item is already in the cart.");

    // 카트에 아이템 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들기
      cart = new Cart({ userId });
      await cart.save();
    }
    const qty = cart.items.length;
    res.status(200).json({ status: "success", qty });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter(({ _id }) => !_id.equals(id));
    await cart.save();
    res.status(200).json({
      status: "success",
      message: "Item has been successfully removed from the cart.",
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.deleteCartAll = async (req, res) => {
  try {
    const { userId } = req;
    await Cart.updateOne({ userId }, { $set: { items: [] } });
    res.status(200).json({
      status: "success",
      message: "All items have been successfully removed from the cart.",
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.updateQty = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId });

    // index 값을 찾는다
    // ObjectId 타입이므로 equals를 사용하여 해당 id와 비교한다
    const target = cart.items.findIndex(({ _id }) => _id.equals(id));

    // 찾는것을 실패 했을때
    if (target === -1) throw new Error("Cannot find the item to edit.");

    cart.items[target].qty = qty;
    cart.items = [...cart.items];

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart.items,
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = cartController;
