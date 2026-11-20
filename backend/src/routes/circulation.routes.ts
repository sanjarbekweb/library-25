import { Router } from 'express';
import { CirculationController } from '../controllers/CirculationController';
import { authenticateUser, requireRole } from '../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new CirculationController();

// All circulation actions require librarian (ASSISTANT) or administrator (ADMIN) privileges
router.use(authenticateUser);
router.use(requireRole([UserRole.ASSISTANT, UserRole.ADMIN]));

router.post('/checkout', (req, res, next) => controller.checkout(req, res, next));
router.post('/checkin', (req, res, next) => controller.checkin(req, res, next));
router.get('/students', (req, res, next) => controller.searchStudents(req, res, next));
router.get('/copies', (req, res, next) => controller.searchCopies(req, res, next));

export default router;
