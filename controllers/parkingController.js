import Parking from '../modals/parkingModal.js';
import asyncHandler from 'express-async-handler';

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
  const parking = await Parking.find({});
  if (parking) {
    res.json({ success: true, data: parking });
  } else {
    res.status(400);
    throw new Error('Not Parking Found');
  }
});

// @desc    create Booking in Parking Area
// @route   POSt /api/parking/
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { parkingID, startdate, enddate, carnumber, slots } = req.body;
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

export { createParking, getParkings, createBooking };
