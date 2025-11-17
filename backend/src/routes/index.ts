/**
 * @summary
 * Main API router. Directs traffic to the appropriate API version.
 *
 * @module routes
 */
import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

// All v1 routes will be prefixed with /v1
router.use('/v1', v1Routes);

// Future versions can be added here (e.g., router.use('/v2', v2Routes))

export default router;
