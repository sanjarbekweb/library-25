import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticateUser, requireRole } from '../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = Router();
const bookController = new BookController();

// Public catalog routes
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

// Protected routes (Assistant / Admin only)
router.use(authenticateUser);
router.use(requireRole([UserRole.ASSISTANT, UserRole.ADMIN]));
router.post('/', bookController.createBook);
router.post('/:id/copies', bookController.addCopy);

export default router;
