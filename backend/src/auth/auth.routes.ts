import { Router } from 'express';
import { register, login } from './auth.controller';
import { validateRegister, validateLogin } from './auth.validation';

const router = Router();

/**
 * POST /api/auth/register
 * Validation middleware → controller
 */
router.post('/register', validateRegister, register);

/**
 * POST /api/auth/login
 * Validation middleware → controller
 */
router.post('/login', validateLogin, login);

export default router;
