const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();

        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("이메일 혹은 패스워드가 일치하지 않습니다.");
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    // 백엔드에서 로그인하기
    // 토큰값을 읽어와서 => 유저정보를 뽑아내고 email
    // a. 이미 로그인을 한적이 있는 유저 => 로그인시키고 토큰값 주면 끝
    // b. 처음 로그인 시도를 한 유저 => 유저정보 먼저 새로 생성 => 토큰값
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

    // 구글에서 만든 토큰이 맞는지 확인
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    // 유저가 존재하는지 찾기
    let user = await User.findOne({ email });
    if (!user) {
      // 없다 -> 유저를 새로 생성
      const randomPassword = "" + Math.floor(Math.random() * 10000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      console.log(3);
      user = new User({
        name,
        email,
        password: newPassword,
      });
      console.log(4);
      await user.save();
    }
    // 토큰발행 리턴
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "success", user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

authController.authenticate = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) {
      throw new Error("invalid token");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
      next();
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (user.level !== "admin") throw new Error("no permission");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = authController;
