import { z } from 'zod';

export const addCopySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  barcode: z.string().optional(),
  condition: z.enum(['MINT', 'GOOD', 'FAIR', 'DAMAGED']).default('MINT')
});
