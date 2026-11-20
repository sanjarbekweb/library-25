import { Router } from 'express';
import { ReservationController } from '../controllers/ReservationController';
import { authenticateUser, requireRole } from '../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new ReservationController();

router.use(authenticateUser);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.post('/:id/cancel', (req, res, next) => controller.cancel(req, res, next));
router.get('/my', (req, res, next) => controller.getMyReservations(req, res, next));
router.get('/book/:bookId', (req, res, next) => controller.getByBookId(req, res, next));
router.get('/pending', requireRole([UserRole.ASSISTANT, UserRole.ADMIN]), (req, res, next) => controller.getPendingHolds(req, res, next));

export default router;
