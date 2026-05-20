import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    isPrivileged,
    canManageClients,
    canAccessBilling,
    canAccessClientInArea,
    isSocio,
} from '../lib/roles.js';

describe('roles', () => {
    it('Socio non è privilegiato', () => {
        assert.equal(isPrivileged('Socio'), false);
        assert.equal(isSocio('Socio'), true);
    });

    it('CDA può gestire clienti', () => {
        assert.equal(canManageClients('CDA'), true);
    });

    it('Socio non gestisce clienti', () => {
        assert.equal(canManageClients('Socio'), false);
    });

    it('Tesoreria accede al fatturato', () => {
        assert.equal(canAccessBilling({ role: 'Tesoreria', area: null }), true);
    });

    it('Area Commerciale accede al fatturato', () => {
        assert.equal(canAccessBilling({ role: 'Socio', area: 'Commerciale' }), true);
    });

    it('CDA senza area Commerciale non accede al fatturato', () => {
        assert.equal(canAccessBilling({ role: 'CDA', area: 'CDA' }), false);
    });

    it('Socio non accede ai clienti', () => {
        const user = { role: 'Socio', area: 'Marketing' };
        assert.equal(canAccessClientInArea(user, 'Marketing'), false);
    });
});
