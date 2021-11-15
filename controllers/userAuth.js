const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc      Register User
// @route     POST /api/v1/user/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, phone, email, password, addiction } = req.body;

  // Create user
  const user = await User.create({
    name, 
    phone,
    email,
    password,
    addiction
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login User
// @route     POST /api/v1/user/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/v1/user/me
// @access    Private
exports.getMe = asyncHandler (async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user details
// @route     PUT /api/v1/user/update-details
// @access    Private
exports.updateDetails = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    rollno: req.body.rollno,
    email: req.body.email,
    hostel: req.body.hostel
  }
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update password
// @route     PUT /api/v1/user/update-password
// @access    Private
exports.updatePassword = asyncHandler (async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if(!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/user/forgot-password
// @access    Public
exports.forgotPassword = asyncHandler (async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave: false});

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of 
  a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }

  // res.status(200).json({
  //   success: true,
  //   data: user
  // });
});

// @desc      Reset password
// @route     PUT /api/v1/user/reset-password/:resetToken
// @access    Public
exports.resetPassword = asyncHandler (async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
  .createHash('sha256')
  .update(req.params.resetToken)
  .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next (new ErrorResponse ('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Get points
// @route     GET /api/v1/user/get-points
// @access    Private
exports.getPoints = asyncHandler (async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+points');
  var now = new Date();
  var Difference_In_Time = new Date(now).getTime() - user.createdAt.getTime();
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  var updatedPoints = Difference_In_Days*20;
  var intPoints = Math.floor( updatedPoints );
  user.points = intPoints;
  await user.save();
  res.status(200).json({
    success: true,
    data: user
  });
});

// Get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
  .status(statusCode)
  .cookie('token', token, options)
  .json({
    success: true,
    token
  });
}