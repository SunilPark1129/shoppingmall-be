const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들어주기
      cart = new Cart({ userId });
      await cart.save();
    }

    // 이미 카트에 들어가있는 아이템이냐? - productId와 size 둘다 확인해야된다
    // ** equals를 사용한 이유는 mongoose.ObjectId 타입이기 때문
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    // 그렇다면 에러
    if (existItem) throw new Error("아이템이 이미 카트에 담겨 있습니다");

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

module.exports = cartController;
