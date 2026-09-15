import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import app from '../index.js';
import User from '../models/User.js';

process.env.JWT_SECRET = 'test-secret';
jest.setTimeout(120000);
let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('auth routes', () => {
  test('signs up with a bcrypt hash and logs in', async () => {
    const signup = await request(app).post('/api/auth/signup').send({ email: 'test@example.com', password: 'password123' });
    expect(signup.status).toBe(201);
    expect(signup.body).toEqual({ id: expect.any(String), email: 'test@example.com' });

    const user = await User.findOne({ email: 'test@example.com' }).lean();
    expect(user.passwordHash).not.toBe('password123');
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);

    const login = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
  });

  test('rejects invalid credentials', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'test@example.com', password: 'password123' });
    const response = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'wrong-password' });
    expect(response.status).toBe(401);
  });
});
