/**
 * POST /api/auth/login — Login Tests
 *
 * TDD Cycle:
 *  RED    → Written BEFORE implementation. All tests fail initially.
 *  GREEN  → Implementation added to make all tests pass.
 *  REFACTOR → Code cleaned up without changing behaviour.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import testPrisma from '../helpers/testClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const testUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Password123',
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Clean slate then seed one registered user for login tests
  await testPrisma.user.deleteMany();
  await request(app).post('/api/auth/register').send(testUser);
});

afterAll(async () => {
  await testPrisma.user.deleteMany();
  await testPrisma.$disconnect();
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  // ── Successful Login ─────────────────────────────────────────────────────

  describe('Successful login', () => {
    it('should return HTTP 200 on successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
    });

    it('should return success status', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.body.status).toBe('success');
    });

    it('should return a JWT access token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.token.length).toBeGreaterThan(0);
    });

    it('should return user information in the response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('should NOT return the password or hash in the response', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return the user id', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.data.user.id).toMatch(uuidRegex);
    });

    it('should return the user role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.body.data.user.role).toBe('USER');
    });
  });

  // ── JWT Verification ─────────────────────────────────────────────────────

  describe('JWT token', () => {
    it('should return a valid JWT that can be decoded', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token = res.body.data.token as string;
      const secret = process.env.JWT_SECRET ?? 'test_jwt_secret_for_testing_only';

      // Should not throw
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      expect(decoded).toBeDefined();
    });

    it('should embed the user ID in the JWT payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token = res.body.data.token as string;
      const secret = process.env.JWT_SECRET ?? 'test_jwt_secret_for_testing_only';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      expect(decoded.userId).toBeDefined();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(decoded.userId).toMatch(uuidRegex);
    });

    it('should embed the user role in the JWT payload', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token = res.body.data.token as string;
      const secret = process.env.JWT_SECRET ?? 'test_jwt_secret_for_testing_only';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      expect(decoded.role).toBe('USER');
    });

    it('should have an expiration time in the JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token = res.body.data.token as string;
      const secret = process.env.JWT_SECRET ?? 'test_jwt_secret_for_testing_only';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  // ── Invalid Credentials ──────────────────────────────────────────────────

  describe('Invalid credentials', () => {
    it('should return HTTP 401 when email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });
      expect(res.status).toBe(401);
    });

    it('should return HTTP 401 when password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass999' });
      expect(res.status).toBe(401);
    });

    it('should use a generic error message that does not reveal if email or password was wrong', async () => {
      const resNoEmail = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });

      const resWrongPass = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass999' });

      // Both should return the exact same message — no info leakage
      expect(resNoEmail.body.message).toBe(resWrongPass.body.message);
    });

    it('should return error status for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });
      expect(res.body.status).toBe('error');
    });
  });

  // ── Validation ───────────────────────────────────────────────────────────

  describe('Validation', () => {
    it('should return HTTP 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'Password123' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password is an empty string', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: '' });
      expect(res.status).toBe(400);
    });

    it('should return error status for validation failures', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad-email', password: 'Password123' });
      expect(res.body.status).toBe('error');
    });
  });
});
