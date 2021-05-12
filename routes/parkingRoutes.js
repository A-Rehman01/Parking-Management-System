import express from 'express';
import {
  createParking,
  getParkings,
  createBooking,
  getParkingsFromUserSide,
} from '../controllers/parkingController.js';
const router = express.Router();
import { protect, admin } from '../middlerwares/authMiddleware.js';

router.route('/create').post(protect, admin, createParking);
router.route('/').get(protect, admin, getParkings).post(protect, createBooking);
router.route('/userside').get(getParkingsFromUserSide);
export default router;
