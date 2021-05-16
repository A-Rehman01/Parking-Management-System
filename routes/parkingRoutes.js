import express from 'express';
import {
  createParking,
  getParkings,
  createBooking,
  getParkingsFromUserSide,
  getMyParking,
  acceptBooking,
  cancelBooking,
} from '../controllers/parkingController.js';
const router = express.Router();
import { protect, admin } from '../middlerwares/authMiddleware.js';

router.route('/create').post(protect, admin, createParking);
router.route('/').get(protect, admin, getParkings).post(protect, createBooking);
router.route('/userside').get(getParkingsFromUserSide);
router.route('/myparking').get(protect, getMyParking);
router.route('/accept/:id').post(protect, admin, acceptBooking);
router.route('/cancel/:id').post(protect, admin, cancelBooking);
export default router;
