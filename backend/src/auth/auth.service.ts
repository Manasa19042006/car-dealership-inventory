import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { RegisterRequestBody, SafeUser } from '../types/auth.types';

/** Number of bcrypt salt rounds — 10 is the industry standard for a good security/performance balance */
const SALT_ROUNDS = 10;

/**
 * Registers a new user.
 *
 * Steps:
 *  1. Check if a user with the given email already exists.
 *  2. Hash the plain-text password with bcrypt.
 *  3. Persist the new user to PostgreSQL via Prisma.
 *  4. Return a safe user object (password excluded).
 *
 * @throws {Error} with code 'EMAIL_IN_USE' if the email is already registered.
 */
export const registerUser = async (
  data: RegisterRequestBody,
): Promise<SafeUser> => {
  const { name, email, password } = data;

  // ── 1. Check for duplicate email ─────────────────────────────────────────
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    const error = new Error('Email is already in use. Please use a different email.');
    (error as Error & { code: string }).code = 'EMAIL_IN_USE';
    throw error;
  }

  // ── 2. Hash the password ──────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ── 3. Create the user in PostgreSQL ─────────────────────────────────────
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      // role defaults to USER as defined in the Prisma schema
    },
    // Select only the safe fields — never return the password
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
