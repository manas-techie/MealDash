const jwt = require("jsonwebtoken");
const { ApiResponse } = require("./apiResponse");

const sendToken = (user, statusCode, message, res) => {

  const token = user.getJWTToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: true
  };

  user.password = undefined;

  res.status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json(
      new ApiResponse(statusCode, message, { user })
    )
};

module.exports = sendToken;