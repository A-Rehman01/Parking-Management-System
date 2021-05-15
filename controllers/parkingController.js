import mongoose from 'mongoose';
import Parking from '../modals/parkingModal.js';
import asyncHandler from 'express-async-handler';
import User from '../modals/userModal.js';
import { Customer } from '../modals/parkingModal.js';
import moment from 'moment';

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
  const pakStartDate = moment(startdate).format();
  const pakEndDate = moment(enddate).format();

  const parking = await Parking.findById(parkingID);
  const user = await User.findById(req.user._id).select('-password');

  const customer = await Customer.find({
    customerID: req.user._id,
    isExpired: false,
    parkingID,
    // $or: [
    //   {
    //     $and: [
    //       { startdate: { $gte:  startdate } }, // 2  1
    //       { enddate: { $lte: startdate } }, //  3    1
    //     ],
    //   },
    //   {
    //     $and: [
    //       { startdate: { $gte: enddate } }, // 2   3
    //       { enddate: { $lte: enddate } }, //    3  3
    //     ],
    //   },
    //   {
    //     $and: [
    //       { startdate: { $lte: startdate } }, //  2   1
    //       { enddate: { $gte: enddate } },  // 3  3
    //     ],
    //   },
    // ],
  });

  if (parking) {
    var check = 0;
    const count = customer.forEach((obj) => {
      if (
        (moment(obj.startdate).format() <= moment(startdate).format() &&
          moment(obj.enddate).format() > moment(startdate).format()) ||
        (moment(obj.startdate).format() < moment(enddate).format() &&
          moment(obj.enddate).format() >= moment(enddate).format()) ||
        (moment(obj.startdate).format() <= moment(startdate).format() &&
          moment(obj.enddate).format() >= moment(enddate).format())
      ) {
        check++;
        // return obj;
        console.log(obj);
      }
    });

    //   3        >=       1
    //    6       <=       1   false
    //   3        >=       5   False
    //    6       <=       5
    //   3        <=       1  False
    //    6       >=       5

    console.log(count);
    if (check >= 3) {
      res.status(400);
      throw new Error('You alreday book 3 times in this Parking Area');
    } else {
      //create Customer
      // const customer = await Customer.create({
      //   customerID: req.user._id,
      //   name: req.user.name,
      //   startdate,
      //   enddate,
      //   carnumber,
      //   slots,
      //   parkingID,
      // });
      res.json({
        success: `You are right ${check} is less than 3`,
        data: count,
      });
    }
  } else {
    res.status(400);
    throw new Error('Not Parking Found');
  }

  // if (customer.length >= 3) {
  //   console.log(customer.length);
  //   res.status(400);
  //   throw new Error('You alreday book 3 times in this Parking Area');
  // } else {
  //   console.log(customer.length);

  //   if (parking) {
  //     const customer = await Customer.create({
  //       customerID: req.user._id,
  //       name: req.user.name,
  //       startdate,
  //       enddate,
  //       carnumber,
  //       slots,
  //       parkingID,
  //     });
  //     try {
  //       const sess = await mongoose.startSession();
  //       await sess.startTransaction();
  //       parking.customers.push(customer._id);
  //       await parking.save();
  //       user.parkings.push(customer._id);
  //       await user.save();
  //       sess.commitTransaction();
  //     } catch (error) {
  //       console.log(error);
  //       res.status(400);
  //       throw new Error('Create  Parking Failed');
  //     }
  //     res.json({ success: true, data: parking });
  //   } else {
  //     res.status(400);
  //     throw new Error('Not Parking Found');
  //   }
  // }
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
