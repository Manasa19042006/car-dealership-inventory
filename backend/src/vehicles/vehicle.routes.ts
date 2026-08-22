import { Router } from 'express';
import { create, list, search, update, remove } from './vehicle.controller';
import { purchase, restock } from './inventory.controller';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  validateSearchVehicles,
} from './vehicle.validation';
import { validateRestock } from './inventory.validation';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

/**
 * GET /api/vehicles/search
 * Must be defined BEFORE /:id routes to prevent Express treating "search" as an id.
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
 * DELETE /api/vehicles/:id  — Admin only
 */
router.delete('/:id', requireAdmin, remove);

/**
 * POST /api/vehicles/:id/purchase
 * Any authenticated user can purchase.
 */
router.post('/:id/purchase', purchase);

/**
 * POST /api/vehicles/:id/restock  — Admin only
 */
router.post('/:id/restock', requireAdmin, validateRestock, restock);

export default router;
