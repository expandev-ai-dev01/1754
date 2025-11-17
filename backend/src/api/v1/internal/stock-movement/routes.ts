import { Router } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validationMiddleware';
import * as controller from './controller';
import {
  createStockMovementSchema,
  listStockMovementsSchema,
} from '@/services/stockMovement/stockMovementValidation';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validate(createStockMovementSchema),
  controller.createStockMovement
);
router.get(
  '/history',
  authMiddleware,
  validate(listStockMovementsSchema),
  controller.listStockMovements
);

export default router;
