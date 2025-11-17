/**
 * @summary
 * Defines internal (authenticated) routes for API v1.
 * Feature-specific routes will be added here.
 *
 * @module routes/v1/internal
 */
import { Router } from 'express';
import productRoutes from '@/api/v1/internal/product/routes';
import stockMovementRoutes from '@/api/v1/internal/stock-movement/routes';

const router = Router();

router.use('/product', productRoutes);
router.use('/stock-movement', stockMovementRoutes);

export default router;
