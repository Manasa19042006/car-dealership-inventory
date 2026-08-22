/**
 * Vehicle Management API Tests
 *
 * Covers:
 *  POST   /api/vehicles          — create
 *  GET    /api/vehicles          — list
 *  GET    /api/vehicles/search   — search / filter
 *  PUT    /api/vehicles/:id      — update
 *  DELETE /api/vehicles/:id      — delete (admin only)
 *
 * TDD Cycle:
 *  RED    → Written before implementation. All tests fail initially.
 *  GREEN  → Implementation added to make all tests pass.
 *  REFACTOR → Code cleaned up without changing behaviour.
 */
import request from 'supertest';
import app from '../../app';
import testPrisma from '../helpers/testClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userCredentials = {
  name: 'Vehicle Tester',
  email: 'vehicletester@example.com',
  password: 'Password123',
};

const adminCredentials = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Password123',
};

const validVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000.00,
  quantity: 10,
};

let userToken: string;
let adminToken: string;
let adminUserId: string;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Clean slate
  await testPrisma.vehicle.deleteMany();
  await testPrisma.user.deleteMany();

  // Register regular user and get token
  await request(app).post('/api/auth/register').send(userCredentials);
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: userCredentials.email, password: userCredentials.password });
  userToken = userLogin.body.data.token as string;

  // Register admin user — promote to ADMIN directly in DB
  await request(app).post('/api/auth/register').send(adminCredentials);
  const adminUser = await testPrisma.user.update({
    where: { email: adminCredentials.email },
    data: { role: 'ADMIN' },
  });
  adminUserId = adminUser.id;

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

beforeEach(async () => {
  // Clean vehicles before each test for full isolation
  await testPrisma.vehicle.deleteMany();
});

// ─── POST /api/vehicles ───────────────────────────────────────────────────────

describe('POST /api/vehicles', () => {
  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).post('/api/vehicles').send(validVehicle);
      expect(res.status).toBe(401);
    });

    it('should allow authenticated user to create a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      expect(res.status).toBe(201);
    });
  });

  describe('Successful creation', () => {
    it('should return 201 with success status', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should return the created vehicle with all fields', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      const vehicle = res.body.data.vehicle;
      expect(vehicle.make).toBe(validVehicle.make);
      expect(vehicle.model).toBe(validVehicle.model);
      expect(vehicle.category).toBe(validVehicle.category);
      expect(Number(vehicle.price)).toBe(validVehicle.price);
      expect(vehicle.quantity).toBe(validVehicle.quantity);
    });

    it('should return the vehicle with a UUID id', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.data.vehicle.id).toMatch(uuidRegex);
    });

    it('should persist the vehicle in PostgreSQL', async () => {
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      const count = await testPrisma.vehicle.count();
      expect(count).toBe(1);
    });

    it('should return createdAt and updatedAt timestamps', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      expect(res.body.data.vehicle.createdAt).toBeDefined();
      expect(res.body.data.vehicle.updatedAt).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should return 400 when make is missing', async () => {
      const { make: _make, ...withoutMake } = validVehicle;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withoutMake);
      expect(res.status).toBe(400);
    });

    it('should return 400 when model is missing', async () => {
      const { model: _model, ...withoutModel } = validVehicle;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withoutModel);
      expect(res.status).toBe(400);
    });

    it('should return 400 when category is missing', async () => {
      const { category: _cat, ...withoutCategory } = validVehicle;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withoutCategory);
      expect(res.status).toBe(400);
    });

    it('should return 400 when price is missing', async () => {
      const { price: _price, ...withoutPrice } = validVehicle;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withoutPrice);
      expect(res.status).toBe(400);
    });

    it('should return 400 when price is negative', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, price: -100 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when price is zero', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, price: 0 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is missing', async () => {
      const { quantity: _qty, ...withoutQty } = validVehicle;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withoutQty);
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is negative', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, quantity: -1 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when make is empty string', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, make: '' });
      expect(res.status).toBe(400);
    });
  });
});

// ─── GET /api/vehicles ────────────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });
  });

  describe('Listing vehicles', () => {
    it('should return 200 with success status', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should return an array of vehicles', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(Array.isArray(res.body.data.vehicles)).toBe(true);
    });

    it('should return empty array when no vehicles exist', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.vehicles).toHaveLength(0);
    });

    it('should return all seeded vehicles', async () => {
      // Seed 3 vehicles
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, make: 'Honda', model: 'Civic' });
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validVehicle, make: 'Ford', model: 'Mustang' });

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.vehicles).toHaveLength(3);
    });

    it('should return vehicles with all expected fields', async () => {
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validVehicle);

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      const vehicle = res.body.data.vehicles[0];
      expect(vehicle).toHaveProperty('id');
      expect(vehicle).toHaveProperty('make');
      expect(vehicle).toHaveProperty('model');
      expect(vehicle).toHaveProperty('category');
      expect(vehicle).toHaveProperty('price');
      expect(vehicle).toHaveProperty('quantity');
      expect(vehicle).toHaveProperty('createdAt');
    });

    it('should return total count in response', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.body.data.total).toBeDefined();
      expect(typeof res.body.data.total).toBe('number');
    });
  });
});

// ─── GET /api/vehicles/search ─────────────────────────────────────────────────

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    // Seed vehicles for search tests
    await testPrisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Camry',   category: 'Sedan',  price: 25000, quantity: 5  },
        { make: 'Toyota', model: 'RAV4',    category: 'SUV',    price: 32000, quantity: 3  },
        { make: 'Honda',  model: 'Civic',   category: 'Sedan',  price: 22000, quantity: 8  },
        { make: 'Ford',   model: 'Mustang', category: 'Coupe',  price: 45000, quantity: 2  },
        { make: 'Ford',   model: 'F-150',   category: 'Truck',  price: 50000, quantity: 0  },
      ],
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/vehicles/search?make=Toyota');
      expect(res.status).toBe(401);
    });
  });

  describe('Search by make', () => {
    it('should return vehicles matching make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(2);
      res.body.data.vehicles.forEach((v: { make: string }) => {
        expect(v.make).toBe('Toyota');
      });
    });

    it('should be case-insensitive when searching by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=toyota')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(2);
    });
  });

  describe('Search by model', () => {
    it('should return vehicles matching model', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?model=Camry')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(1);
      expect(res.body.data.vehicles[0].model).toBe('Camry');
    });
  });

  describe('Search by category', () => {
    it('should return vehicles matching category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Sedan')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(2);
    });
  });

  describe('Filter by price range', () => {
    it('should filter by minimum price', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=40000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      res.body.data.vehicles.forEach((v: { price: string }) => {
        expect(Number(v.price)).toBeGreaterThanOrEqual(40000);
      });
    });

    it('should filter by maximum price', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?maxPrice=25000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      res.body.data.vehicles.forEach((v: { price: string }) => {
        expect(Number(v.price)).toBeLessThanOrEqual(25000);
      });
    });

    it('should filter by both min and max price', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=22000&maxPrice=32000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles.length).toBeGreaterThanOrEqual(1);
      res.body.data.vehicles.forEach((v: { price: string }) => {
        expect(Number(v.price)).toBeGreaterThanOrEqual(22000);
        expect(Number(v.price)).toBeLessThanOrEqual(32000);
      });
    });

    it('should return 400 when minPrice is not a number', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=abc')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 400 when maxPrice is not a number', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?maxPrice=xyz')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 400 when minPrice is negative', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=-100')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('Combined filters', () => {
    it('should combine make and category filters', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota&category=SUV')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(1);
      expect(res.body.data.vehicles[0].model).toBe('RAV4');
    });

    it('should return empty array when no vehicles match filters', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Tesla')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.vehicles).toHaveLength(0);
    });
  });
});

// ─── PUT /api/vehicles/:id ────────────────────────────────────────────────────

describe('PUT /api/vehicles/:id', () => {
  let vehicleId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    vehicleId = res.body.data.vehicle.id as string;
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .send({ make: 'Honda' });
      expect(res.status).toBe(401);
    });
  });

  describe('Successful update', () => {
    it('should return 200 on successful update', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Honda' });
      expect(res.status).toBe(200);
    });

    it('should return updated vehicle data', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Honda', model: 'Accord' });
      expect(res.body.data.vehicle.make).toBe('Honda');
      expect(res.body.data.vehicle.model).toBe('Accord');
    });

    it('should persist the update in PostgreSQL', async () => {
      await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Nissan' });

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(vehicle?.make).toBe('Nissan');
    });

    it('should only update the provided fields', async () => {
      await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Honda' });

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id: vehicleId } });
      // model should remain unchanged
      expect(vehicle?.model).toBe(validVehicle.model);
    });
  });

  describe('Validation', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .put('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Honda' });
      expect(res.status).toBe(404);
    });

    it('should return 400 when price is negative', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: -500 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when quantity is negative', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: -1 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when make is empty string', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: '' });
      expect(res.status).toBe(400);
    });
  });
});

// ─── DELETE /api/vehicles/:id ─────────────────────────────────────────────────

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    vehicleId = res.body.data.vehicle.id as string;
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('Authorization', () => {
    it('should return 403 when a normal USER tries to delete', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to delete a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Successful deletion', () => {
    it('should return success status when ADMIN deletes', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.body.status).toBe('success');
    });

    it('should actually remove the vehicle from the database', async () => {
      await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const vehicle = await testPrisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(vehicle).toBeNull();
    });
  });

  describe('Not found', () => {
    it('should return 404 when vehicle does not exist', async () => {
      const res = await request(app)
        .delete('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
