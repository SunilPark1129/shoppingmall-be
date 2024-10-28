const Product = require("../models/Product");

const productController = {};
const PAGE_SIZE = 5;

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    let { page, name } = req.query;
    page = page || 1;

    const cond = name
      ? {
          name: { $regex: name, $options: "i" },
        }
      : {};

    let query = Product.find(cond);
    const response = { status: "success" };

    if (page) {
      // skip과 limit은 몽구스에서 서포트하는 함수
      // skip  - 앞의 아이템들을 몇개 스킵할 것인지 정함
      // limit - 최대 몇개의 아이템들을 포함할지 정함

      // (page-1)*5 -> 해당 페이지부터 5개의 페이지를 가져옴
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      // 전체 페이지 구하기
      // 1. 데이터가 총 몇개인지 구함
      const totalItemNum = await Product.find(cond).countDocuments(); // count()는 더이상 지원하지 않고 countDocuments로 전체 숫자만 가져옴

      // 2. 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    // exec() 실행하고 싶을때 사용
    const productList = await query.exec();
    response.data = productList;

    res.status(200).json({ ...response });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true } // 리턴 값을 원할시에 new true를 한다
    );

    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", data: error.message });
  }
};

module.exports = productController;
