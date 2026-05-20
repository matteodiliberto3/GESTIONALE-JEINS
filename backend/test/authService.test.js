import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toPublicUser } from '../services/authService.js';

describe('authService.toPublicUser', () => {
    it('mappa campi pubblici', () => {
        const u = toPublicUser({
            user_id: 'uuid-1',
            name: 'Mario',
            email: 'm@x.it',
            area: 'IT',
            role: 'Socio',
        });
        assert.equal(u.id, 'uuid-1');
        assert.equal(u.role, 'Socio');
        assert.equal(u.permissions.isSocio, true);
        assert.equal(u.permissions.viewClients, false);
        assert.equal(u.permissions.viewMyTasks, true);
    });
});
