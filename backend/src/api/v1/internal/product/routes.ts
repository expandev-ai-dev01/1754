import { Router } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validationMiddleware';
import * as controller from './controller';
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
  productIdSchema,
} from '@/services/product/productValidation';

const router = Router();

router.post('/', authMiddleware, validate(createProductSchema), controller.createProduct);
router.get('/', authMiddleware, validate(listProductsSchema), controller.listProducts);
router.get('/:id', authMiddleware, validate(productIdSchema), controller.getProductById);
router.put('/:id', authMiddleware, validate(updateProductSchema), controller.updateProduct);
router.delete('/:id', authMiddleware, validate(productIdSchema), controller.deleteProduct);

export default router;
