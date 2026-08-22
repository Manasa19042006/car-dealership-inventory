import { Router } from 'express';
import { create, list, search, update, remove } from './vehicle.controller';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  validateSearchVehicles,
} from './vehicle.validation';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

/**
 * GET /api/vehicles/search
 * Must be defined BEFORE /:id to prevent Express matching "search" as an id.
 */
router.get('/search', validateSearchVehicles, search);

/**
 * GET /api/vehicles
 */
router.get('/', list);

/**
 * POST /api/vehicles
 */
router.post('/', validateCreateVehicle, create);

/**
 * PUT /api/vehicles/:id
 */
router.put('/:id', validateUpdateVehicle, update);

/**
 * DELETE /api/vehicles/:id
 * Admin only — requireAdmin runs after authenticate (already applied above).
 */
router.delete('/:id', requireAdmin, remove);

export default router;
