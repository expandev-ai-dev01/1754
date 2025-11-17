import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .regex(/^[a-zA-Z0-9-]*$/, 'SKU can only contain letters, numbers, and hyphens'),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(150, 'Name must be 150 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  initialQuantity: z.coerce.number().int().min(0, 'Initial quantity must be 0 or greater'),
  minimumStockLevel: z.coerce.number().int().min(0, 'Minimum stock level must be 0 or greater'),
});

export const createStockMovementSchema = z
  .object({
    idProduct: z.coerce.number().positive('Product must be selected'),
    movementType: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE'], {
      required_error: 'Movement type is required',
    }),
    quantity: z.coerce.number().int().positive('Quantity must be a positive number'),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.movementType === 'SAIDA' || data.movementType === 'AJUSTE') &&
        (!data.reason || data.reason.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Reason is required for SAIDA or AJUSTE movements',
      path: ['reason'],
    }
  );
