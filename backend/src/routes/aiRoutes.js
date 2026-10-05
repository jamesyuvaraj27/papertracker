import express from 'express';
import { analyzePaperAbstract } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/analyze-abstract', analyzePaperAbstract);

export default router;
