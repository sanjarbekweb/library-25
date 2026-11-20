import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { authenticateUser, requireRole } from '../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new FeedbackController();

// Publicly visible book reviews
router.get('/book/:bookId', (req, res, next) => controller.getByBook(req, res, next));

// Authenticated student actions
router.use(authenticateUser);
router.post('/', (req, res, next) => controller.submit(req, res, next));
router.get('/eligible', (req, res, next) => controller.getEligible(req, res, next));

// Administrator review moderation & audit
router.get('/admin', requireRole([UserRole.ADMIN]), (req, res, next) => controller.getAdmin(req, res, next));
router.patch('/:id/moderate', requireRole([UserRole.ADMIN]), (req, res, next) => controller.moderate(req, res, next));
router.delete('/:id', requireRole([UserRole.ADMIN]), (req, res, next) => controller.delete(req, res, next));

export default router;
