/**
 * Health Endpoint Tests
 *
 * Tests for GET /api/health
 *
 * TDD Approach:
 *  RED   → Write this test first (before the endpoint exists)
 *  GREEN → Implement GET /api/health to make it pass
 *  REFACTOR → Clean up as needed
 *
 * The health endpoint already exists from Step 1, so these tests
 * should pass immediately — confirming our test setup is working.
 */
import request from 'supertest';
import app from '../app';

describe('GET /api/health', () => {
  it('should return 200 status code', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('should return status "ok"', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.status).toBe('ok');
  });

  it('should return the correct message', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.message).toBe('Car Dealership API is running');
  });

  it('should return a timestamp in ISO 8601 format', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.timestamp).toBeDefined();

    // Validate ISO 8601 format (e.g. "2026-08-22T10:00:00.000Z")
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(response.body.timestamp).toMatch(iso8601Regex);
  });

  it('should return JSON content-type', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return all required fields in the response body', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('GET /api/unknown-route', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should return error status for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');
    expect(response.body.status).toBe('error');
  });

  it('should return a message for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');
    expect(response.body.message).toBe('Route not found');
  });
});
