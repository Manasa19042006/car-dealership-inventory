import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { RegisterRequestBody, LoginRequestBody, SafeUser } from '../types/auth.types';
import { signToken } from '../utils/jwt';

/** Number of bcrypt salt rounds — 10 is the industry standard */
const SALT_ROUNDS = 10;

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Registers a new user.
 *
 * Steps:
 *  1. Check for duplicate email.
 *  2. Hash the plain-text password with bcrypt.
 *  3. Persist the new user to PostgreSQL.
 *  4. Return a safe user object (password excluded).
 *
 * @throws {Error} with code 'EMAIL_IN_USE' if the email is already registered.
 */
export const registerUser = async (
  data: RegisterRequestBody,
): Promise<SafeUser> => {
  const { name, email, password } = data;

  // 1. Duplicate email check
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    const error = new Error('Email is already in use. Please use a different email.');
    (error as Error & { code: string }).code = 'EMAIL_IN_USE';
    throw error;
  }

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create the user — role defaults to USER via Prisma schema
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/** Shape of a successful login result */
export interface LoginResult {
  user: SafeUser;
  token: string;
}

/**
 * Authenticates a user with email and password.
 *
 * Steps:
 *  1. Look up the user by email.
 *  2. Compare the submitted password against the stored bcrypt hash.
 *  3. Sign and return a JWT.
 *
 * Security: intentionally uses the same generic error for "user not found"
 * and "wrong password" to prevent email enumeration attacks.
 *
 * @throws {Error} with code 'INVALID_CREDENTIALS' on any auth failure.
 */
export const loginUser = async (data: LoginRequestBody): Promise<LoginResult> => {
  const { email, password } = data;

  const INVALID = 'Invalid email or password.';

  // 1. Find user by email (fetch password hash for bcrypt compare)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    const error = new Error(INVALID);
    (error as Error & { code: string }).code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // 2. Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error(INVALID);
    (error as Error & { code: string }).code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // 3. Sign JWT — never include password in payload
  const token = signToken(user.id, user.role);

  // Return safe user (no password) + token
  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: safeUser, token };
};
