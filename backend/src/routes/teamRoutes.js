import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', authorize('admin'), createTeam);
router.put('/:id', authorize('admin', 'guide'), updateTeam);
router.delete('/:id', authorize('admin'), deleteTeam);

export default router;
