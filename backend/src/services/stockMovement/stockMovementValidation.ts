import { z } from 'zod';
import { zId } from '@/utils/zodValidation';

export const createStockMovementSchema = z.object({
  body: z.object({
    idProduct: zId,
    movementType: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']),
    quantity: z.number().int(), // Positive/negative validation is in the SP
    reason: z.string().trim().max(255).optional().nullable(),
  }),
});

export const listStockMovementsSchema = z.object({
  query: z.object({
    idProduct: z.coerce.number().int().positive().optional(),
    movementType: z.coerce.number().int().min(1).max(2).optional(), // 1: ENTRADA, 2: SAIDA
    dateStart: z.coerce.date().optional(),
    dateEnd: z.coerce.date().optional(),
    pageNumber: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(20),
  }),
});
