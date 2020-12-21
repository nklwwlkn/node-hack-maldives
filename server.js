/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
/* UNCAUGHT EXCEPTION LISTENER: */
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('db connection OK');
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running at port: ${port}`);
});

/* Листенер на unhandledRejection: */

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION');

  server.close(() => {
    process.exit(1);
  });
});
