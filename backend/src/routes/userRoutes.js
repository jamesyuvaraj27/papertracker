import express from 'express';
import {
  getGuides,
  getStudents,
  createGuide,
  updateGuide,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/guides', getGuides);
router.get('/students', getStudents);
router.post('/guides', authorize('admin'), createGuide);
router.put('/guides/:id', authorize('admin'), updateGuide);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

export default router;
