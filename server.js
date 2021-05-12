import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import usersRoutes from './routes/userRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import { errorHandler, notFound } from './middlerwares/errorMiddleware.js';

//DB
import connectDB from './config/db.js';

dotenv.config();

//Conneect DB
connectDB();

const app = express();

//Except JSON data in body-parser
app.use(express.json());

//APIs info
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test Server
app.get('/', (req, res) => {
  res.send('Parking Management Backend APIs ....');
});

//Routes
app.use('/api/users', usersRoutes);
app.use('/api/parkings', parkingRoutes);

//Custom_Errorhandling
app.use(notFound);
app.use(errorHandler);

//PORT
const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server Running ${process.env.NODE_ENV} mode in ${PORT}`.yellow.bold
  )
);
