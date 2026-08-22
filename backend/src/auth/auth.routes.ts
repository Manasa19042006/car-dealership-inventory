import { Router } from 'express';
import { register } from './auth.controller';
import { validateRegister } from './auth.validation';

const router = Router();

/**
 * POST /api/auth/register
 * Validation middleware runs first, then the controller.
 */
router.post('/register', validateRegister, register);

export default router;
