/**
 * Paginazione offset-based (?limit=&cursor= come offset).
 * Per cursori stabili su grandi dataset usare keyset in futuro.
 */
export function parsePagination(query, { defaultLimit = 50, maxLimit = 200 } = {}) {
    const limit = Math.min(
        maxLimit,
        Math.max(1, parseInt(String(query.limit ?? defaultLimit), 10) || defaultLimit),
    );
    const offset = Math.max(0, parseInt(String(query.cursor ?? 0), 10) || 0);
    return { limit, offset };
}

export function buildPaginatedResult(rows, { limit, offset }) {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
        items,
        pagination: {
            limit,
            cursor: offset,
            nextCursor: hasMore ? offset + limit : null,
            hasMore,
        },
    };
}

/** Aggiunge LIMIT/OFFSET alla query (fetch limit+1 per hasMore). */
export function sqlLimitOffset(limit, offset) {
    return ` LIMIT ${limit + 1} OFFSET ${offset}`;
}
