const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const activityRouter = require('./routes/tourRoutes');

const app = express();
app.use(cookieParser());

/* MIDDLEWARES: */
app.use(compression());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests per hour'
});

app.use('/api', limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: []
  })
);
/* app.use(express.static(`${__dirname}/public`)); */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/* ROUTES: */
app.use('/api/v1/users', userRouter);
app.use('/api/v1/activitites', activityRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
