const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    // 프론트에서 이미 한번 에러 핸들링을 하고 전달되지만
    // 안전 차원에서 백엔드에서도 에러 핸들링 한번 더 실행
    if (!name || !email || !password) {
      throw new Error("필요한 모든 정보를 입력하지 않았습니다.");
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입된 유저입니다.");
    }
    const salt = bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = userController;
