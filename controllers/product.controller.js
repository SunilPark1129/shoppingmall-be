const Product = require("../models/Product");

const productController = {};
const PAGE_SIZE = 8;

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
    let { page, name, category } = req.query;
    page = page || 1;

    const cond = {};

    if (name) {
      cond.name = { $regex: name, $options: "i" };
    }

    if (category?.length > 0) {
      // 카테고리를 두개 이상 받아 올 수 있음으로 항상 어레이로 묶어주기
      const categoryArray = Array.isArray(category) ? category : [category];

      // sale !== 0 -> 가져오기
      if (categoryArray.includes("sale")) {
        cond.sale = { $ne: 0 };
      }

      const filteredCategoryArray = categoryArray.filter(
        (item) => item !== "sale"
      );

      // 어레이 경우
      // $in 사용 어레이에 있는 스트링 or 상태로 다 가져온다
      // $all 사용하면 어레이에 포함된것만 and 상태로 가져온다
      if (filteredCategoryArray.length !== 0) {
        cond.category = { $all: filteredCategoryArray };
      }
    }

    let query = Product.find(cond);
    const response = { status: "success" };

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

    // exec() 실행하고 싶을때 사용
    const productList = await query.exec();
    response.data = productList;

    res.status(200).json({ ...response });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.getDetail = async (req, res) => {
  try {
    let { id } = req.query;
    const product = await Product.findById(
      { _id: id },
      "-createdAt -updatedAt -__v"
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
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
      sale,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        size,
        image,
        price,
        description,
        category,
        stock,
        status,
        sale,
      },
      { new: true } // 리턴 값을 원할시에 new true를 한다
    );

    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.updateSale = async (req, res) => {
  try {
    const productId = req.params.id;
    const { sale } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      $set: { sale: sale },
    });

    if (!updatedProduct)
      return res
        .status(404)
        .json({ status: "fail", message: "could not find item" });

    res.status(200).json({ status: "success", data: updatedProduct });
  } catch (error) {
    res.status(400).json({ status: "fail", data: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete({ _id: productId });
    if (!product) throw new Error("could not find item id");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.checkStock = async (item) => {
  // 내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);

  // 내가 사려는 아이템 qty, 재고 비교
  if (product.stock[item.size] < item.qty) {
    // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `Insufficient stock for ${product.name} in size ${item.size}. `,
    };
  }

  // 충분하다면, 제고에서 - qty 성공
  return { isVerify: true, message: "" };
};

productController.updateStock = async (item) => {
  const product = await Product.findById(item.productId);

  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return;
};

productController.checkItemListStock = async (itemList) => {
  try {
    const insufficientStockItems = [];
    // 재고 확인 로직
    // Promise all로 통해서 비동기를 동시에 다 실행시킨다
    await Promise.all(
      itemList.map(async (item) => {
        const stockCheck = await productController.checkStock(item);
        if (!stockCheck.isVerify)
          return insufficientStockItems.push(stockCheck);
      })
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    await Promise.all(
      itemList.map(async (item) => {
        await productController.updateStock(item);
      })
    );

    return;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = productController;
