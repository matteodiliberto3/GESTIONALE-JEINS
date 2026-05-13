import {
    pgTable, uuid, varchar, text, boolean, integer, numeric, timestamp, date,
    jsonb, primaryKey, index, check, unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// =====================================================
// V1 — schema originale
// =====================================================

export const users = pgTable('users', {
    userId:       uuid('user_id').primaryKey().defaultRandom(),
    name:         varchar('name', { length: 255 }).notNull(),
    email:        varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    area:         varchar('area', { length: 50 }),
    role:         varchar('role', { length: 50 }).default('Socio'),
    avatarUrl:    varchar('avatar_url', { length: 500 }),
    handle:       varchar('handle', { length: 64 }),
    color:        varchar('color', { length: 20 }),
    createdAt:    timestamp('created_at').defaultNow(),
    updatedAt:    timestamp('updated_at').defaultNow(),
}, (t) => ({
    areaCheck: check('users_area_check', sql`${t.area} IN ('CDA','Marketing','IT','Commerciale')`),
    roleCheck: check('users_role_check', sql`${t.role} IN ('Socio','Responsabile','Admin')`),
}));

export const clients = pgTable('clients', {
    clientId:      uuid('client_id').primaryKey().defaultRandom(),
    name:          varchar('name', { length: 255 }).notNull(),
    contactPerson: varchar('contact_person', { length: 255 }),
    email:         varchar('email', { length: 255 }),
    phone:         varchar('phone', { length: 50 }),
    status:        varchar('status', { length: 50 }).default('Prospect'),
    area:          varchar('area', { length: 50 }),
    createdBy:     uuid('created_by').references(() => users.userId, { onDelete: 'set null' }),
    createdAt:     timestamp('created_at').defaultNow(),
    updatedAt:     timestamp('updated_at').defaultNow(),
}, (t) => ({
    statusCheck:        check('clients_status_check', sql`${t.status} IN ('Prospect','In Contatto','In Negoziazione','Attivo','Chiuso','Perso')`),
    areaCheck:          check('clients_area_check',   sql`${t.area} IN ('CDA','Marketing','IT','Commerciale')`),
    createdByIdx:       index('idx_clients_created_by').on(t.createdBy),
}));

export const projects = pgTable('projects', {
    projectId: uuid('project_id').primaryKey().defaultRandom(),
    name:      varchar('name', { length: 255 }).notNull(),
    clientId:  uuid('client_id').references(() => clients.clientId, { onDelete: 'cascade' }),
    area:      varchar('area', { length: 50 }),
    status:    varchar('status', { length: 50 }).default('Pianificato'),
    createdBy: uuid('created_by').references(() => users.userId, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    statusCheck:    check('projects_status_check', sql`${t.status} IN ('Pianificato','In Corso','In Revisione','Completato','Sospeso')`),
    areaCheck:      check('projects_area_check',   sql`${t.area} IN ('CDA','Marketing','IT','Commerciale')`),
    clientIdx:      index('idx_projects_client_id').on(t.clientId),
    createdByIdx:   index('idx_projects_created_by').on(t.createdBy),
}));

export const todos = pgTable('todos', {
    todoId:    uuid('todo_id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    text:      text('text').notNull(),
    completed: boolean('completed').default(false),
    priority:  varchar('priority', { length: 20 }).default('Media'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    priorityCheck: check('todos_priority_check', sql`${t.priority} IN ('Bassa','Media','Alta')`),
    projectIdx:    index('idx_todos_project_id').on(t.projectId),
}));

export const contracts = pgTable('contracts', {
    contractId: uuid('contract_id').primaryKey().defaultRandom(),
    clientId:   uuid('client_id').references(() => clients.clientId, { onDelete: 'cascade' }),
    projectId:  uuid('project_id').references(() => projects.projectId, { onDelete: 'set null' }),
    type:       varchar('type', { length: 50 }).notNull(),
    amount:     numeric('amount', { precision: 10, scale: 2 }).notNull(),
    status:     varchar('status', { length: 50 }).default('Bozza'),
    date:       date('date').notNull(),
    createdBy:  uuid('created_by').references(() => users.userId, { onDelete: 'set null' }),
    createdAt:  timestamp('created_at').defaultNow(),
    updatedAt:  timestamp('updated_at').defaultNow(),
}, (t) => ({
    typeCheck:   check('contracts_type_check',   sql`${t.type} IN ('Contratto','Fattura','Preventivo')`),
    statusCheck: check('contracts_status_check', sql`${t.status} IN ('Bozza','Inviato','Firmato','Pagato','Annullato')`),
    clientIdx:   index('idx_contracts_client_id').on(t.clientId),
    projectIdx:  index('idx_contracts_project_id').on(t.projectId),
}));

export const events = pgTable('events', {
    eventId:     uuid('event_id').primaryKey().defaultRandom(),
    title:       varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    startTime:   timestamp('start_time').notNull(),
    endTime:     timestamp('end_time').notNull(),
    isCall:      boolean('is_call').default(false),
    callLink:    varchar('call_link', { length: 500 }),
    creatorId:   uuid('creator_id').references(() => users.userId, { onDelete: 'cascade' }),
    createdAt:   timestamp('created_at').defaultNow(),
    updatedAt:   timestamp('updated_at').defaultNow(),
}, (t) => ({
    timeCheck:    check('events_time_check', sql`${t.endTime} > ${t.startTime}`),
    creatorIdx:   index('idx_events_creator_id').on(t.creatorId),
    startIdx:     index('idx_events_start_time').on(t.startTime),
}));

export const participants = pgTable('participants', {
    participantId: uuid('participant_id').primaryKey().defaultRandom(),
    eventId:       uuid('event_id').references(() => events.eventId, { onDelete: 'cascade' }),
    userId:        uuid('user_id').references(() => users.userId, { onDelete: 'cascade' }),
    status:        varchar('status', { length: 20 }).default('pending'),
    createdAt:     timestamp('created_at').defaultNow(),
    updatedAt:     timestamp('updated_at').defaultNow(),
}, (t) => ({
    statusCheck:  check('participants_status_check', sql`${t.status} IN ('pending','accepted','declined')`),
    eventIdx:     index('idx_participants_event_id').on(t.eventId),
    userIdx:      index('idx_participants_user_id').on(t.userId),
    eventUserUq:  unique('participants_event_user_unique').on(t.eventId, t.userId),
}));

// =====================================================
// V2 — estensione board / sprint / activity / chat
// =====================================================

export const boardColumns = pgTable('board_columns', {
    columnId:  uuid('column_id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    name:      varchar('name', { length: 80 }).notNull(),
    accent:    varchar('accent', { length: 20 }).default('violet'),
    position:  integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    projectIdx: index('idx_board_columns_project').on(t.projectId),
}));

export const sprints = pgTable('sprints', {
    sprintId:        uuid('sprint_id').primaryKey().defaultRandom(),
    projectId:       uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    name:            varchar('name', { length: 120 }).notNull(),
    goal:            text('goal'),
    startDate:       date('start_date').notNull(),
    endDate:         date('end_date').notNull(),
    targetPoints:    integer('target_points').default(0),
    completedPoints: integer('completed_points').default(0),
    status:          varchar('status', { length: 20 }).default('planned'),
    createdAt:       timestamp('created_at').defaultNow(),
    updatedAt:       timestamp('updated_at').defaultNow(),
}, (t) => ({
    statusCheck: check('sprints_status_check', sql`${t.status} IN ('planned','active','closed')`),
    dateCheck:   check('sprints_date_check',   sql`${t.endDate} >= ${t.startDate}`),
    projectIdx:  index('idx_sprints_project').on(t.projectId),
}));

export const tasks = pgTable('tasks', {
    taskId:      uuid('task_id').primaryKey().defaultRandom(),
    projectId:   uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    columnId:    uuid('column_id').references(() => boardColumns.columnId, { onDelete: 'set null' }),
    sprintId:    uuid('sprint_id').references(() => sprints.sprintId, { onDelete: 'set null' }),
    title:       varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    coverUrl:    varchar('cover_url', { length: 500 }),
    priority:    varchar('priority', { length: 20 }).default('Media'),
    storyPoints: integer('story_points').default(0),
    startDate:   date('start_date'),
    dueDate:     date('due_date'),
    position:    integer('position').notNull().default(0),
    createdBy:   uuid('created_by').references(() => users.userId, { onDelete: 'set null' }),
    createdAt:   timestamp('created_at').defaultNow(),
    updatedAt:   timestamp('updated_at').defaultNow(),
}, (t) => ({
    priorityCheck: check('tasks_priority_check', sql`${t.priority} IN ('Bassa','Media','Alta')`),
    projectIdx:    index('idx_tasks_project').on(t.projectId),
    columnIdx:     index('idx_tasks_column').on(t.columnId),
    sprintIdx:     index('idx_tasks_sprint').on(t.sprintId),
}));

export const subtasks = pgTable('subtasks', {
    subtaskId: uuid('subtask_id').primaryKey().defaultRandom(),
    taskId:    uuid('task_id').references(() => tasks.taskId, { onDelete: 'cascade' }),
    text:      text('text').notNull(),
    completed: boolean('completed').default(false),
    position:  integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    taskIdx: index('idx_subtasks_task').on(t.taskId),
}));

export const taskAssignees = pgTable('task_assignees', {
    taskId:     uuid('task_id').references(() => tasks.taskId, { onDelete: 'cascade' }).notNull(),
    userId:     uuid('user_id').references(() => users.userId, { onDelete: 'cascade' }).notNull(),
    assignedAt: timestamp('assigned_at').defaultNow(),
}, (t) => ({
    pk:      primaryKey({ columns: [t.taskId, t.userId] }),
    userIdx: index('idx_task_assignees_user').on(t.userId),
}));

export const timeEntries = pgTable('time_entries', {
    entryId:   uuid('entry_id').primaryKey().defaultRandom(),
    userId:    uuid('user_id').references(() => users.userId, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.projectId, { onDelete: 'set null' }),
    taskId:    uuid('task_id').references(() => tasks.taskId, { onDelete: 'set null' }),
    hours:     numeric('hours', { precision: 5, scale: 2 }).notNull(),
    entryDate: date('entry_date').notNull(),
    note:      text('note'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    hoursCheck:  check('time_entries_hours_check', sql`${t.hours} >= 0 AND ${t.hours} <= 24`),
    userDateIdx: index('idx_time_entries_user_date').on(t.userId, t.entryDate),
    projectIdx:  index('idx_time_entries_project').on(t.projectId),
}));

export const activities = pgTable('activities', {
    activityId: uuid('activity_id').primaryKey().defaultRandom(),
    actorId:    uuid('actor_id').references(() => users.userId, { onDelete: 'set null' }),
    type:       varchar('type', { length: 40 }).notNull(),
    targetType: varchar('target_type', { length: 40 }),
    targetId:   uuid('target_id'),
    projectId:  uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    payload:    jsonb('payload'),
    createdAt:  timestamp('created_at').defaultNow(),
}, (t) => ({
    projectIdx: index('idx_activities_project').on(t.projectId),
    createdIdx: index('idx_activities_created').on(t.createdAt),
}));

export const chats = pgTable('chats', {
    chatId:    uuid('chat_id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.projectId, { onDelete: 'cascade' }),
    name:      varchar('name', { length: 120 }),
    isGroup:   boolean('is_group').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatMembers = pgTable('chat_members', {
    chatId:   uuid('chat_id').references(() => chats.chatId, { onDelete: 'cascade' }).notNull(),
    userId:   uuid('user_id').references(() => users.userId, { onDelete: 'cascade' }).notNull(),
    joinedAt: timestamp('joined_at').defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.chatId, t.userId] }),
}));

export const messages = pgTable('messages', {
    messageId: uuid('message_id').primaryKey().defaultRandom(),
    chatId:    uuid('chat_id').references(() => chats.chatId, { onDelete: 'cascade' }),
    senderId:  uuid('sender_id').references(() => users.userId, { onDelete: 'set null' }),
    body:      text('body').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    chatCreatedIdx: index('idx_messages_chat').on(t.chatId, t.createdAt),
}));
