import mongoose from 'mongoose';
import Parking from '../modals/parkingModal.js';
import asyncHandler from 'express-async-handler';
import User from '../modals/userModal.js';
import { Customer } from '../modals/parkingModal.js';

// @desc    Create Parking Area
// @route   POST /api/parking/create
// @access  Private/Admin
const createParking = asyncHandler(async (req, res) => {
  const { parkingname, capacity } = req.body;

  const parking = await Parking.create({
    owner: req.user._id,
    parkingname,
    capacity,
  });
  if (parking) {
    res.json({ success: true, data: parking });
  } else {
    res.status(400);
    throw new Error('Invalid Data');
  }
});

// @desc    Get All Parkings Areas
// @route   GET /api/parking/
// @access  Private/Admin
const getParkings = asyncHandler(async (req, res) => {
  const parking = await Parking.find({}).populate({
    path: 'customers',
    populate: { path: 'customerID' },
  });

  if (parking.length) {
    res.json({ success: true, data: parking });
  } else {
    res.status(400);
    throw new Error('Not Parking Found');
  }
});

// @desc    Get All Parkings Areas From User Side
// @route   GET /api/parking/userside
// @access  Private/Admin
const getParkingsFromUserSide = asyncHandler(async (req, res) => {
  const parking = await Parking.find({}).select('-customers');
  if (parking.length) {
    res.json({ success: true, data: parking });
  } else {
    res.status(400);
    throw new Error('Not Parking Found');
  }
});

// @desc    Get Parking by  user
// @route   GET /api/parking/myparking
// @access  Private
const getMyParking = asyncHandler(async (req, res) => {
  if (req.user._id) {
    const customer = await Customer.find({ customerID: req.user._id });
    if (customer.length) {
      res.json({ success: true, data: customer });
    } else {
      res.status(400);
      throw new Error('Not Parking Found');
    }
  } else {
    res.status(401);
    throw new Error('User Not Found');
  }
});

// @desc    create Booking in Parking Area
// @route   POSt /api/parking/
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { parkingID, startdate, enddate, carnumber, slots } = req.body;
  const parking = await Parking.findById(parkingID);
  const user = await User.findById(req.user._id).select('-password');
  const customer = await Customer.find({
    customerID: req.user._id,
    parkingID,
    $or: [
      {
        $and: [
          { startdate: { $gte: new Date(startdate) } },
          { enddate: { $lte: new Date(startdate) } },
        ],
      },
      {
        $and: [
          { startdate: { $gte: new Date(enddate) } },
          { enddate: { $lte: new Date(enddate) } },
        ],
      },
      {
        $and: [
          { startdate: { $lte: new Date(startdate) } },
          { enddate: { $gte: new Date(enddate) } },
        ],
      },
    ],
  });
  if (customer.length >= 3) {
    console.log(customer.length);
    res.status(400);
    throw new Error('You alreday book 3 times in this Parking Area');
  } else {
    console.log(customer.length);

    if (parking) {
      const customer = await Customer.create({
        customerID: req.user._id,
        name: req.user.name,
        startdate,
        enddate,
        carnumber,
        slots,
        parkingID,
      });
      try {
        const sess = await mongoose.startSession();
        await sess.startTransaction();
        parking.customers.push(customer._id);
        await parking.save();
        user.parkings.push(customer._id);
        await user.save();
        sess.commitTransaction();
      } catch (error) {
        console.log(error);
        res.status(400);
        throw new Error('Create  Parking Failed');
      }
      res.json({ success: true, data: parking });
    } else {
      res.status(400);
      throw new Error('Not Parking Found');
    }
  }
});

// @desc    Accept Booking in Parking Area
// @route   POSt /api/parking/accept
// @access  Private/Admin
const acceptBooking = asyncHandler(async (req, res) => {
  const { parkingID } = req.body;
  const parking = await Parking.findById(parkingID);
  if (parking) {
    let createCustomer = {
      customerID: req.user._id,
      name: req.user.name,
      startdate,
      enddate,
      carnumber,
      slots,
    };
    parking.customers.push(createCustomer);
    await parking.save();
    res.json({ success: true, data: parking });
  } else {
    res.status(400);
    throw new Error('Not Parking Found');
  }
});

export {
  createParking,
  getParkings,
  createBooking,
  getParkingsFromUserSide,
  getMyParking,
};
