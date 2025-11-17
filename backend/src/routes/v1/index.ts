/**
 * @summary
 * Router for API version 1. Aggregates all v1 routes.
 *
 * @module routes/v1
 */
import { Router } from 'express';
import internalRoutes from './internalRoutes';
import externalRoutes from './externalRoutes';

const router = Router();

// Routes that require authentication
router.use('/internal', internalRoutes);

// Publicly accessible routes
router.use('/external', externalRoutes);

export default router;
