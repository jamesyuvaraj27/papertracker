import express from 'express';
import { getAcademicYears, createAcademicYear } from '../controllers/academicYearController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAcademicYears);
router.post('/', authorize('admin'), createAcademicYear);

export default router;
