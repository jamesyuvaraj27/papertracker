import express from 'express';
import {
  getPresentationReviews,
  submitPresentationReview,
} from '../controllers/presentationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPresentationReviews);
router.post('/', authorize('guide', 'admin'), submitPresentationReview);

export default router;
