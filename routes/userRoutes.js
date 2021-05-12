import express from 'express';
import {
  authUser,
  getUserProfile,
  registerUser,
  getUsers,
  deleteUser,
  getUserById,
} from '../controllers/userController.js';

const router = express.Router();
import { protect, admin } from '../middlerwares/authMiddleware.js';

router.route('/login').post(authUser);
router.route('/').post(registerUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/').get(protect, admin, getUsers);

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById);

export default router;
