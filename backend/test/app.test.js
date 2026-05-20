import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../app.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-min-32-characters-long';

describe('app', () => {
    let app;

    before(() => {
        app = createApp();
    });

    it('GET /health risponde', async () => {
        const res = await request(app).get('/health');
        assert.ok([200, 500].includes(res.status));
        assert.ok(res.body.status);
    });

    it('GET / risponde online', async () => {
        const res = await request(app).get('/');
        assert.equal(res.status, 200);
        assert.equal(res.body.status, 'online');
    });

    it('POST /api/auth/login valida email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad', password: 'x' });
        assert.equal(res.status, 400);
    });

    it('POST /api/auth/register valida password corta', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test',
                email: 'test@example.com',
                password: '123',
            });
        assert.equal(res.status, 400);
    });
});
