import express from 'express';
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmissionStatus,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);
router.post('/', upload.single('file'), createSubmission);
router.patch('/:id/status', authorize('guide', 'admin'), updateSubmissionStatus);

export default router;
