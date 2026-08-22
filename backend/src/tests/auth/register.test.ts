/**
 * POST /api/auth/register — Registration Tests
 *
 * TDD Cycle:
 *  RED    → These tests are written BEFORE the implementation exists.
 *           They will FAIL until registration is implemented.
 *  GREEN  → Implementation is added to make all tests pass.
 *  REFACTOR → Code is cleaned up without changing behaviour.
 */
import request from 'supertest';
import app from '../../app';
import testPrisma from '../helpers/testClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeEach(async () => {
  // Clean users table before every test so tests are fully isolated
  await testPrisma.user.deleteMany();
});

afterAll(async () => {
  // Final cleanup and disconnect
  await testPrisma.user.deleteMany();
  await testPrisma.$disconnect();
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  // ── Successful Registration ──────────────────────────────────────────────

  describe('Successful registration', () => {
    it('should return HTTP 201 on successful registration', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(201);
    });

    it('should return success status in response body', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.status).toBe('success');
    });

    it('should return the created user object', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    it('should return the correct name and email', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.data.user.name).toBe(validUser.name);
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should NOT return the password or password hash in the response', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return the user id as a UUID', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.data.user.id).toMatch(uuidRegex);
    });

    it('should assign the default role of USER', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.data.user.role).toBe('USER');
    });

    it('should return createdAt timestamp', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.data.user.createdAt).toBeDefined();
    });
  });

  // ── Password Security ────────────────────────────────────────────────────

  describe('Password security', () => {
    it('should store the password as a bcrypt hash in the database', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const userInDb = await testPrisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(userInDb).not.toBeNull();
      // bcrypt hashes always start with $2b$ or $2a$
      expect(userInDb!.password).toMatch(/^\$2[ab]\$/);
    });

    it('should NOT store the plain-text password in the database', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const userInDb = await testPrisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(userInDb!.password).not.toBe(validUser.password);
    });
  });

  // ── Database Persistence ─────────────────────────────────────────────────

  describe('Database persistence', () => {
    it('should actually create the user in PostgreSQL', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const userInDb = await testPrisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(userInDb).not.toBeNull();
      expect(userInDb!.name).toBe(validUser.name);
      expect(userInDb!.email).toBe(validUser.email);
    });

    it('should persist the correct default role to the database', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const userInDb = await testPrisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(userInDb!.role).toBe('USER');
    });
  });

  // ── Duplicate Email ──────────────────────────────────────────────────────

  describe('Duplicate email', () => {
    it('should return HTTP 409 when email is already registered', async () => {
      // First registration — should succeed
      await request(app).post('/api/auth/register').send(validUser);

      // Second registration with same email — should fail
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });

    it('should return an error message for duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toMatch(/email.*already/i);
    });

    it('should not create a second user with the same email', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      await request(app).post('/api/auth/register').send(validUser);

      const count = await testPrisma.user.count({
        where: { email: validUser.email },
      });
      expect(count).toBe(1);
    });
  });

  // ── Validation — Name ────────────────────────────────────────────────────

  describe('Validation — name', () => {
    it('should return HTTP 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(400);
    });

    it('should return a validation error message when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: validUser.email, password: validUser.password });
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBeDefined();
    });

    it('should return HTTP 400 when name is an empty string', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, name: '' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when name is only whitespace', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, name: '   ' });
      expect(res.status).toBe(400);
    });
  });

  // ── Validation — Email ───────────────────────────────────────────────────

  describe('Validation — email', () => {
    it('should return HTTP 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: validUser.name, password: validUser.password });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when email is invalid format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when email is missing @ symbol', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: 'johndoeexample.com' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when email is empty string', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, email: '' });
      expect(res.status).toBe(400);
    });
  });

  // ── Validation — Password ────────────────────────────────────────────────

  describe('Validation — password', () => {
    it('should return HTTP 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: validUser.name, email: validUser.email });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password is too short (less than 8 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'Pass1' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password has no uppercase letter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password has no lowercase letter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'PASSWORD123' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password has no digit', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'PasswordOnly' });
      expect(res.status).toBe(400);
    });

    it('should return HTTP 400 when password is an empty string', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: '' });
      expect(res.status).toBe(400);
    });
  });
});
