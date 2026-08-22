/**
 * Inventory Operations Tests
 *
 * Covers:
 *  POST /api/vehicles/:id/purchase  — decrements quantity by 1
 *  POST /api/vehicles/:id/restock   — increments quantity by given amount (admin only)
 *
 * TDD Cycle:
 *  RED    → Written BEFORE implementation. All tests fail initially.
 *  GREEN  → Implementation added to make all tests pass.
 *  REFACTOR → Code cleaned up without changing behaviour.
 */
import request from 'supertest';
import app from '../../app';
import testPrisma from '../helpers/testClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userCredentials = {
  name: 'Inventory Tester',
  email: 'inventorytester@example.com',
  password: 'Password123',
};

const adminCredentials = {
  name: 'Inventory Admin',
  email: 'inventoryadmin@example.com',
  password: 'Password123',
};

const baseVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
};

let userToken: string;
let adminToken: string;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await testPrisma.vehicle.deleteMany();
  await testPrisma.user.deleteMany();

  // Register regular user
  await request(app).post('/api/auth/register').send(userCredentials);
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: userCredentials.email, password: userCredentials.password });
  userToken = userLogin.body.data.token as string;

  // Register and promote admin user
  await request(app).post('/api/auth/register').send(adminCredentials);
  await testPrisma.user.update({
    where: { email: adminCredentials.email },
    data: { role: 'ADMIN' },
  });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminCredentials.email, password: adminCredentials.password });
  adminToken = adminLogin.body.data.token as string;
});

afterAll(async () => {
  await testPrisma.vehicle.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.$disconnect();
});

// Helper: create a fresh vehicle with given quantity and return its id
const createVehicle = async (quantity: number): Promise<string> => {
  const res = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ ...baseVehicle, quantity });
  return res.body.data.vehicle.id as string;
};

// ─── POST /api/vehicles/:id/purchase ─────────────────────────────────────────

describe('POST /api/vehicles/:id/purchase', () => {

  // ── Authentication ───────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const id = await createVehicle(5);
      const res = await request(app).post(`/api/vehicles/${id}/purchase`);
      expect(res.status).toBe(401);
    });
  });

  // ── Successful purchase ──────────────────────────────────────────────────

  describe('Successful purchase', () => {
    it('should return 200 when authenticated user purchases a vehicle', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return success status', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.status).toBe('success');
    });

    it('should decrease quantity by exactly 1', async () => {
      const id = await createVehicle(5);
      await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(4);
    });

    it('should return the updated vehicle with new quantity', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.vehicle.quantity).toBe(4);
    });

    it('should allow purchase when quantity is exactly 1', async () => {
      const id = await createVehicle(1);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(0);
    });

    it('should persist the quantity change to PostgreSQL', async () => {
      const id = await createVehicle(3);
      await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(2);
    });

    it('should allow ADMIN to purchase a vehicle too', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Out of stock ─────────────────────────────────────────────────────────

  describe('Out of stock', () => {
    it('should return 400 when quantity is zero', async () => {
      const id = await createVehicle(0);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('should return error status when out of stock', async () => {
      const id = await createVehicle(0);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.status).toBe('error');
    });

    it('should return a descriptive out-of-stock message', async () => {
      const id = await createVehicle(0);
      const res = await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.message).toMatch(/out of stock|not available|quantity/i);
    });

    it('should NEVER let quantity go below zero', async () => {
      const id = await createVehicle(0);
      await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBeGreaterThanOrEqual(0);
    });

    it('should not decrease quantity when out of stock', async () => {
      const id = await createVehicle(0);
      await request(app)
        .post(`/api/vehicles/${id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(0);
    });
  });

  // ── Not found ────────────────────────────────────────────────────────────

  describe('Not found', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/00000000-0000-0000-0000-000000000000/purchase')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  // ── Atomicity ────────────────────────────────────────────────────────────

  describe('Atomicity', () => {
    it('should handle sequential purchases atomically — quantity must not go below 0', async () => {
      // Create a vehicle with quantity 2
      const id = await createVehicle(2);

      // Fire 4 concurrent purchase requests — only 2 should succeed
      const results = await Promise.all([
        request(app)
          .post(`/api/vehicles/${id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
        request(app)
          .post(`/api/vehicles/${id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
        request(app)
          .post(`/api/vehicles/${id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
        request(app)
          .post(`/api/vehicles/${id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
      ]);

      // Exactly 2 should succeed (200), the rest should fail (400 out of stock)
      const successes = results.filter((r) => r.status === 200);
      const failures = results.filter((r) => r.status === 400);

      expect(successes.length).toBe(2);
      expect(failures.length).toBe(2);

      // Final quantity in DB must be exactly 0
      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(0);
    });
  });
});

// ─── POST /api/vehicles/:id/restock ──────────────────────────────────────────

describe('POST /api/vehicles/:id/restock', () => {

  // ── Authentication ───────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .send({ quantity: 10 });
      expect(res.status).toBe(401);
    });
  });

  // ── Authorization ────────────────────────────────────────────────────────

  describe('Authorization', () => {
    it('should return 403 when a normal USER tries to restock', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });
      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to restock a vehicle', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });
      expect(res.status).toBe(200);
    });
  });

  // ── Successful restock ───────────────────────────────────────────────────

  describe('Successful restock', () => {
    it('should return 200 with success status', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should increase quantity by the specified amount', async () => {
      const id = await createVehicle(5);
      await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(15);
    });

    it('should return the updated vehicle with new quantity', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 });
      expect(res.body.data.vehicle.quantity).toBe(25);
    });

    it('should persist the quantity change to PostgreSQL', async () => {
      const id = await createVehicle(0);
      await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id } });
      expect(vehicle?.quantity).toBe(50);
    });

    it('should allow restocking when quantity is currently zero', async () => {
      const id = await createVehicle(0);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });
      expect(res.status).toBe(200);
    });
  });

  // ── Validation ───────────────────────────────────────────────────────────

  describe('Validation', () => {
    it('should return 400 when quantity is missing', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is zero', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is negative', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is not an integer', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 2.5 });
      expect(res.status).toBe(400);
    });

    it('should return error status for invalid quantity', async () => {
      const id = await createVehicle(5);
      const res = await request(app)
        .post(`/api/vehicles/${id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -1 });
      expect(res.body.status).toBe('error');
    });
  });

  // ── Not found ────────────────────────────────────────────────────────────

  describe('Not found', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/00000000-0000-0000-0000-000000000000/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });
      expect(res.status).toBe(404);
    });
  });
});
