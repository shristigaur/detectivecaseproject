import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import authMiddleware from '../middleware/authMiddleware.js';

process.env.JWT_SECRET = 'test-secret';

describe('authMiddleware', () => {
  test('rejects missing authorization', () => {
    const request = { get: () => undefined };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches userId for a valid bearer token', () => {
    const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET);
    const request = { get: () => `Bearer ${token}` };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(request, response, next);

    expect(request.userId).toBe('user-123');
    expect(next).toHaveBeenCalled();
  });
});
