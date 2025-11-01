import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { Types } from 'mongoose';
import { describe, test, expect } from '@jest/globals';

// Helper to generate a test JWT aligned with verifyToken expectations
const generateToken = (userId: string, email = 'user@example.com') => {
  const secret = process.env.JWT_SECRET || 'testsecret';
  return jwt.sign({ userId, email }, secret, { expiresIn: '1h' });
};

describe('Document Routes Integration', () => {
  const basePath = '/api/v1/documents';
  const ownerId = new Types.ObjectId().toHexString();
  const token = generateToken(ownerId, 'user@example.com');

  test('Create document', async () => {
    const res = await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Doc', content: 'Hello World' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toMatchObject({ title: 'Test Doc', content: 'Hello World' });
    expect(res.body.data).toHaveProperty('_id');
  });

  test('Fetch documents', async () => {
    // Create one document for the owner
    await request(app)
      .post(basePath)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Doc A', content: 'A content' })
      .expect(201);

    const res = await request(app)
      .get(basePath)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('title');
  });

  test('Unauthorized access (missing token)', async () => {
    const res = await request(app).get(basePath);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message');
  });
});