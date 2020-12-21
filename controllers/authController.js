/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
require('dotenv/config');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const jwt = require('jsonwebtoken');
const util = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // eslint-disable-next-line no-param-reassign
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token
  });
};

const sendCode = catchAsync(async (phoneNumber, channel = 'sms', res) => {
  let data; 

  process.env.NODE_ENV === 'production' ? data = await client.verify.services(process.env.TWILIO_SERVISE_ID).verifications.create({
    to: `+${phoneNumber}`,
    channel: channel === 'call' ? 'call' : 'sms'
  }) : data = true;

  if (data) {
    res.status(200).json({
      status: 'success',
      results: data.status,
      data
    });
  } else {
    return new AppError('Ошибка с отправкой варификационного кода', 400);
  }
});

exports.userVerify = catchAsync(async (req, res, next) => {
  const { phoneNumber, code } = req.body;

  if (phoneNumber && code.length === 4) {
    const user = await User.findOne({ phoneNumber });

    /* const data = await client.verify
      .services(process.env.TWILIO_SERVISE_ID)
      .verificationChecks.create({
        to: `+${phoneNumber}`,
        code
      }); */


    if (phoneNumber && code) {
      await User.findOneAndUpdate(phoneNumber, { activated: true });
      
      return sendToken(user, 200, res);
    }

  }
  return next(new AppError('Incorrect code or phone number', 400));
});

exports.signUp = catchAsync(async (req, res, next) => {
  const {phoneNumber } = req.body;

  let newUser = await User.findOne({ phoneNumber });

  if (!newUser) {
    newUser = await User.create({
      phoneNumber,
      role: "user"
    })  
  }

  return  sendCode(phoneNumber, 'sms', res); 
});

 exports.login = catchAsync(async (req, res, next) => {
  /* const { phoneNumber } = req.body;

  if (phoneNumber) {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(new AppError('Пользователя с таким номером не существует', 400));
    }

     await sendCode(phoneNumber, 'sms', res); 

    
  } */
}); 

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    /* if (!roles.includes(req.user.role)) {
      return next(new AppError('Role'), 403);
    } */
    next();
  };
};
