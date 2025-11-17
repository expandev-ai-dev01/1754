import { z } from 'zod';
import { zId } from '@/utils/zodValidation';

export const createProductSchema = z.object({
  body: z.object({
    sku: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(/^[a-zA-Z0-9-]*$/, 'SKU can only contain letters, numbers, and hyphens'),
    name: z.string().trim().min(3).max(150),
    description: z.string().trim().max(500).optional().nullable(),
    initialQuantity: z.number().int().min(0),
    minimumStockLevel: z.number().int().min(0),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: zId }),
  body: z.object({
    name: z.string().trim().min(3).max(150),
    description: z.string().trim().max(500).optional().nullable(),
    minimumStockLevel: z.number().int().min(0),
    status: z.number().int().min(0).max(1), // 0: Inactive, 1: Active
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    pageNumber: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(20),
  }),
});

export const productIdSchema = z.object({
  params: z.object({ id: zId }),
});
