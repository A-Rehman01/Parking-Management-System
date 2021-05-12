import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import User from './modals/userModal.js';

import Parking from './modals/parkingModal.js';
import parkings from './data/parking.js';

import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Parking.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    const normalUser = createdUsers[1]._id;

    const samplecustomers = parkings[0].customers.map((customer) => ({
      ...customer,
      customerID: normalUser,
    }));

    const sampleParkings = parkings.map((parking) => ({
      ...parking,
      customers: samplecustomers,
      owner: adminUser,
    }));

    await Parking.insertMany(sampleParkings);
    console.log('Data imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error.message}`.green.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    // await Parking.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(`${error}`.green.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
