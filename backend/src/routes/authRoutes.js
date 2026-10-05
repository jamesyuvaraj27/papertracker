import express from 'express';
import { loginUser, getMe, updateProfile, registerUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
