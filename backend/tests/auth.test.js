const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints & Validation', () => {
  it('GET /health - should return server health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('POST /api/auth/register - should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'invalid-email', password: 'password123' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
