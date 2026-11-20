import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateUser, requireRole } from '../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new UserController();

router.use(authenticateUser);

// Personal profile info & JIT sync
router.get('/me', (req, res, next) => controller.getMe(req, res, next));
router.post('/sync', (req, res, next) => controller.syncUser(req, res, next));

// Administrative user directory and privilege controls
router.get('/', requireRole([UserRole.ADMIN]), (req, res, next) => controller.getUsers(req, res, next));
router.patch('/:id/role', requireRole([UserRole.ADMIN]), (req, res, next) => controller.updateRole(req, res, next));
router.patch('/:id/status', requireRole([UserRole.ADMIN]), (req, res, next) => controller.toggleStatus(req, res, next));

export default router;
