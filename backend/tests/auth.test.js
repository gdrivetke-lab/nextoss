const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../src/app');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextoss_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  server.close();
});

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@nextoss.com',
    password: 'test123456',
  };

  let token;

  test('POST /api/auth/register - should register user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe(testUser.username);
    token = res.body.token;
  });

  test('POST /api/auth/login - should login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/health - should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/auth/guest - should create guest user', async () => {
    const res = await request(app).post('/api/auth/guest');
    expect(res.status).toBe(200);
    expect(res.body.user.auth.isGuest).toBe(true);
  });
});
