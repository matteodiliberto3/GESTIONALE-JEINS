import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination, buildPaginatedResult } from '../lib/pagination.js';

describe('pagination', () => {
    it('parsePagination usa default', () => {
        const p = parsePagination({});
        assert.equal(p.limit, 50);
        assert.equal(p.offset, 0);
    });

    it('parsePagination rispetta max', () => {
        const p = parsePagination({ limit: '999' }, { maxLimit: 100 });
        assert.equal(p.limit, 100);
    });

    it('buildPaginatedResult espone nextCursor', () => {
        const rows = [1, 2, 3];
        const r = buildPaginatedResult(rows, { limit: 2, offset: 0 });
        assert.equal(r.items.length, 2);
        assert.equal(r.pagination.nextCursor, 2);
        assert.equal(r.pagination.hasMore, true);
    });
});
