/**
 * Schema Drizzle — sorgente per Studio / push / generate.
 * Dopo il primo collegamento al DB remoto, esegui: npm run db:pull
 * per rigenerare questo file dall'introspection PostgreSQL.
 */
import {
    boolean,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    userId: uuid('user_id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    area: varchar('area', { length: 50 }),
    role: varchar('role', { length: 50 }).default('Socio'),
    isActive: boolean('is_active').default(true),
    lastSeen: timestamp('last_seen', { withTimezone: true }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    handle: varchar('handle', { length: 64 }),
    color: varchar('color', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const schemaMigrations = pgTable('schema_migrations', {
    filename: varchar('filename', { length: 255 }).primaryKey(),
    appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow(),
});
