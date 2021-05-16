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
    res.json({
      success: true,
      data: { ...parking, availability: parking.availability },
    });
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
  const totalCustomerBooking = await Customer.find({
    customerID: req.user._id,
    isExpired: false,
    parkingID,
    $or: [
      {
        $and: [
          { startdate: { $lte: startdate } },
          { enddate: { $gt: startdate } },
        ],
      },
      {
        $and: [{ startdate: { $lt: enddate } }, { enddate: { $gte: enddate } }],
      },
      {
        $and: [
          { startdate: { $gte: startdate } },
          { enddate: { $lte: enddate } },
        ],
      },
    ],
  });

  if (parking && Number(parking?.availability) >= Number(slots)) {
    // var check = 0;
    // const count = totalCustomerBooking.forEach((obj) => {
    //   if (
    //     (moment(obj.startdate).format() <= moment(startdate).format() &&
    //       moment(obj.enddate).format() > moment(startdate).format()) ||
    //     (moment(obj.startdate).format() < moment(enddate).format() &&
    //       moment(obj.enddate).format() >= moment(enddate).format()) ||
    //     (moment(obj.startdate).format() >= moment(startdate).format() &&
    //       moment(obj.enddate).format() <= moment(enddate).format())
    //   ) {
    //     check++;
    //     console.log(obj);
    //   }
    // });

    if (totalCustomerBooking.length >= 3) {
      res.status(400);
      throw new Error('you already book 3 times in these time slots');
    } else {
      //create Customer
      const customer = await Customer.create({
        customerID: req.user._id,
        name: req.user.name,
        startdate,
        enddate,
        carnumber,
        slots,
        parkingID,
        parkingname: parking?.parkingname,
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
      res.json({
        success: true,
        data: parking,
      });
    }
  } else {
    res.status(400);
    throw new Error(
      !parking
        ? 'Not Parking Found'
        : Number(parking?.availability) === 0
        ? 'Parking is Full Now'
        : `Only ${parking?.availability} Slots are available`
    );
  }
});

// @desc    Accept Booking in Parking Area
// @route   POSt /api/parking/accept
// @access  Private/Admin
const acceptBooking = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer && customer.status === 'pending') {
    try {
      await customer.changeIsExpiredStatus(customer.parkingID);
      // await Customer.findByIdAndUpdate(req.params.id, { status: 'active' });
      customer.status = 'active';
      await customer.save();
      const { slots, parkingID } = customer;
      const parking = await Parking.findById(parkingID);
      parking.occupied = parking.occupied + slots;
      await parking.save();
    } catch (err) {
      console.log(err);
      res.status(400);
      throw new Error('Change isExpired Failed');
    }
    res.json({ success: true, data: customer });
  } else {
    res.status(400);
    throw new Error(
      !customer
        ? 'Customer not Found'
        : customer.status === 'active'
        ? 'status is alreday active '
        : 'status is cancel '
    );
  }
});

// @desc    Cancel Booking in Parking Area
// @route   POSt /api/parking/cancel
// @access  Private/Admin
const cancelBooking = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer && customer.status === 'pending') {
    customer.status = 'cancel';
    // customer.isExpired = true;
    await customer.save();
    res.json({ success: true, data: customer });
  } else {
    res.status(400);
    throw new Error(
      !customer
        ? 'Customer not Found'
        : customer.status === 'active'
        ? 'status is an active '
        : 'status is already cancel'
    );
  }
});

export {
  createParking,
  getParkings,
  createBooking,
  getParkingsFromUserSide,
  getMyParking,
  acceptBooking,
  cancelBooking,
};
