const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
const userAuth = require('./routes/userAuth');

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/user', userAuth);

app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
  );

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});