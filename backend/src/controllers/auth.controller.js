const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/sendToken");
const catchAsyncErrors = require("../utils/catchAsyncErrors");


// Register user
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phoneNumber } = req.body;

  //TODO: add avatar upload functionality using multer and cloudinary

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
    avatar,
  })

  sendToken(user, 201, res);
});

