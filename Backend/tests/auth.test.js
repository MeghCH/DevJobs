// ---------------------------------------------------------------------------
// Mock mysql2/promise so config/db.js never tries to reach a real MySQL server.
// Every file that requires config/db will get a mock pool created via the
// intercepted createPool().
// ---------------------------------------------------------------------------
jest.mock('mysql2/promise', () => {
    const mockQuery = jest.fn(() => Promise.resolve([[{ cnt: 1 }]]));
    const mockGetConnection = jest.fn(() => Promise.resolve({ release: jest.fn() }));

    const mockPool = {
        query: mockQuery,
        getConnection: mockGetConnection,
    };

    return { createPool: jest.fn(() => mockPool) };
});

// Ensure JWT_SECRET is present before any controller that requires jsonwebtoken sets up.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret';

const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const mockQuery = db.query;

describe('Auth Routes', () => {
    beforeEach(() => {
        mockQuery.mockReset();
        mockQuery.mockResolvedValue([[{ cnt: 1 }]]);
    });

    /**
     * Requirement: automated tests covering at minimum two backend API routes
     * Test 1: POST /api/auth/register — successful registration
     */
    test('POST /api/auth/register — creates a new user and returns 201', async () => {
        const insertId = 14;
        mockQuery
            .mockResolvedValueOnce([[]])                     // SELECT existing user
            .mockResolvedValueOnce([{ insertId }])           // INSERT user
            .mockResolvedValueOnce([[{
                id: insertId,
                name: 'Doe',
                firstname: 'John',
                email: 'john-test@example.com',
                role: 'user',
                company: null,
                siret: null,
                created_at: new Date().toISOString(),
            }]]);

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Doe',
                firstname: 'John',
                email: 'john-test@example.com',
                password: 'testpassword123',
                role: 'user',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('john-test@example.com');
    });

    /**
     * Test 2: POST /api/auth/login — authenticates existing user
     */
    test('POST /api/auth/login — returns user info for valid credentials', async () => {
        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash('testpassword123', 12);

        mockQuery.mockResolvedValueOnce([[{
            id: 1,
            email: 'john-test@example.com',
            name: 'Doe',
            firstname: 'John',
            password: hashed,
            role: 'user',
            created_at: new Date().toISOString(),
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john-test@example.com',
                password: 'testpassword123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe('john-test@example.com');
        expect(res.body.user.role).toBe('user');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('POST /api/auth/login — returns 401 for wrong password', async () => {
        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash('rightpassword', 12);

        mockQuery.mockResolvedValueOnce([[{
            id: 1,
            email: 'john-test@example.com',
            password: hashed,
            role: 'user',
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john-test@example.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
