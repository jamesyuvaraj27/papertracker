import express from 'express';
import {
  getParameters,
  getEvaluations,
  getEvaluationById,
  submitEvaluation,
} from '../controllers/evaluationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/parameters', getParameters);
router.get('/', getEvaluations);
router.get('/:id', getEvaluationById);
router.post('/', authorize('guide', 'admin'), submitEvaluation);

export default router;
