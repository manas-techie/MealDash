const User = require("../models/user.model");
const crypto = require("crypto");
const sendToken = require("../utils/sendToken");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Email = require("../utils/email");
const { ApiResponse } = require("../utils/apiResponse");


// Register user
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phoneNumber, avatar } = req.body || {};

  if (!name || !email || !password || !passwordConfirm || !phoneNumber) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  //TODO: add avatar upload functionality using multer and cloudinary

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
    avatar,
  })

  try {
    const welcomeURL = `${process.env.FRONTEND_URL}/dashboard`;
    await new Email(user, welcomeURL).sendWelcome();
  } catch (err) {
    console.error("Welcome email failed to send:", err);
  }

  sendToken(user, 201, "User registered successfully", res);
});

// Login user
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body || {};

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email", 401));
  }

  const isPasswordMatched = await user.comparePassword(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  sendToken(user, 200, "Login successful", res);
});

//logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
  // res.cookie("jwt", null), {
  //   expires: new Date(Date.now()),
  //   httpOnly: true,
  // }
  const user = req.user;
  User.findByIdAndUpdate(
    user._id,
    {
      $unset: { jwtToken: "" }
    },
    {
      new: true
    }
  ).exec();

  options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  }
  res.status(200)
    .clearCookie("jwt", options)
    .json(
      new ApiResponse(200, "Logout successful", {})
    );
})

// get currently logged in user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(
    new ApiResponse(200, "User details retrieved successfully", { user })
  );
})

// Update Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body || {};

  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    return next(new ErrorHandler("Please provide old and new password fields", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  const isMatched = await user.comparePassword(oldPassword, user.password);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, "Password updated successfully", { user })
  );
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("There is no user with email address .", 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONTEND_URL}/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json(
      new ApiResponse(200, "Token sent to email!")
    );
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorHandler(
        "There was an error sending the email, try again later!",
        500,
      ),
    );
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  sendToken(user, 200, "Password reset successful", res);
});