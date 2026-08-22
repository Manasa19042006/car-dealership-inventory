/**
 * Authentication Middleware Tests
 *
 * Tests for the JWT authentication middleware applied to protected routes.
 * A dummy protected route GET /api/test/protected is used purely for testing.
 *
 * TDD Cycle:
 *  RED    → Written before the middleware exists.
 *  GREEN  → Middleware implemented to pass all tests.
 *  REFACTOR → Code improved without changing behaviour.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import testPrisma from '../helpers/testClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const testUser = {
  name: 'Middleware Tester',
  email: 'middleware@example.com',
  password: 'Password123',
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_for_testing_only';

/** Creates an expired JWT for testing */
const createExpiredToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: -1 });
};

/** Creates a valid token directly (bypassing login) */
const createValidToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────

let validToken: string;
let userId: string;

beforeAll(async () => {
  await testPrisma.user.deleteMany({ where: { email: testUser.email } });

  // Register and login to get a real token
  await request(app).post('/api/auth/register').send(testUser);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: testUser.password });

  validToken = loginRes.body.data.token as string;
  userId = loginRes.body.data.user.id as string;
});

afterAll(async () => {
  await testPrisma.user.deleteMany({ where: { email: testUser.email } });
  await testPrisma.$disconnect();
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Authentication Middleware', () => {
  // ── Valid Token ──────────────────────────────────────────────────────────

  describe('Valid token', () => {
    it('should allow access with a valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.status).toBe(200);
    });

    it('should expose the authenticated user ID to the route', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.body.data.userId).toBe(userId);
    });

    it('should expose the authenticated user role to the route', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.body.data.role).toBe('USER');
    });
  });

  // ── Missing / Malformed Header ───────────────────────────────────────────

  describe('Missing or malformed Authorization header', () => {
    it('should return HTTP 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/test/protected');
      expect(res.status).toBe(401);
    });

    it('should return error status when Authorization header is missing', async () => {
      const res = await request(app).get('/api/test/protected');
      expect(res.body.status).toBe('error');
    });

    it('should return HTTP 401 when Authorization header has no Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', validToken); // missing "Bearer "
      expect(res.status).toBe(401);
    });

    it('should return HTTP 401 when Authorization header is malformed', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Basic sometoken');
      expect(res.status).toBe(401);
    });

    it('should return HTTP 401 when token is empty string after Bearer', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });
  });

  // ── Invalid Token ────────────────────────────────────────────────────────

  describe('Invalid token', () => {
    it('should return HTTP 401 for an invalid JWT', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer this.is.not.a.valid.jwt');
      expect(res.status).toBe(401);
    });

    it('should return HTTP 401 for a JWT signed with a different secret', async () => {
      const wrongToken = jwt.sign({ userId, role: 'USER' }, 'wrong-secret', {
        expiresIn: '1h',
      });
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${wrongToken}`);
      expect(res.status).toBe(401);
    });

    it('should return HTTP 401 for a tampered JWT', async () => {
      // Tamper the payload part of the token
      const parts = validToken.split('.');
      const tampered = `${parts[0]}.TAMPERED${parts[1]}.${parts[2]}`;
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${tampered}`);
      expect(res.status).toBe(401);
    });
  });

  // ── Expired Token ────────────────────────────────────────────────────────

  describe('Expired token', () => {
    it('should return HTTP 401 for an expired JWT', async () => {
      const expiredToken = createExpiredToken(userId, 'USER');
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('should return error status for expired token', async () => {
      const expiredToken = createExpiredToken(userId, 'USER');
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.body.status).toBe('error');
    });
  });

  // ── ADMIN role ───────────────────────────────────────────────────────────

  describe('Role in token', () => {
    it('should correctly expose ADMIN role from a token', async () => {
      // Create a synthetic admin token for testing role exposure
      const adminToken = createValidToken(userId, 'ADMIN');
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.body.data.role).toBe('ADMIN');
    });
  });
});
