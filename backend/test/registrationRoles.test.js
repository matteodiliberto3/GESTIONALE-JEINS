import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { resolveRegistrationRole } from '../lib/registrationRoles.js';

describe('resolveRegistrationRole', () => {
    const prevHash = process.env.ELEVATED_REGISTRATION_CODE_HASH;
    const prevRole = process.env.ELEVATED_REGISTRATION_ROLE;

    before(async () => {
        process.env.ELEVATED_REGISTRATION_CODE_HASH = await bcrypt.hash('test-secret-code', 10);
        process.env.ELEVATED_REGISTRATION_ROLE = 'CDA';
    });

    after(() => {
        process.env.ELEVATED_REGISTRATION_CODE_HASH = prevHash;
        process.env.ELEVATED_REGISTRATION_ROLE = prevRole;
    });

    it('senza codice assegna Socio', async () => {
        const r = await resolveRegistrationRole('');
        assert.equal(r.role, 'Socio');
    });

    it('codice valido assegna CDA', async () => {
        const r = await resolveRegistrationRole('test-secret-code');
        assert.equal(r.role, 'CDA');
    });

    it('codice errato restituisce 403', async () => {
        const r = await resolveRegistrationRole('wrong');
        assert.equal(r.error, 'Codice di accesso non valido');
        assert.equal(r.status, 403);
    });
});
