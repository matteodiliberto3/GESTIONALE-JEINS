-- Schema v2: estensione per dashboard moderna stile Dev.ui
-- Idempotente: usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- 1) Estensione tabella users con avatar e handle
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS handle VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- 2) Colonne Kanban per progetto
CREATE TABLE IF NOT EXISTS board_columns (
    column_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    accent VARCHAR(20) DEFAULT 'violet',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_board_columns_project ON board_columns(project_id);

-- 3) Sprints
CREATE TABLE IF NOT EXISTS sprints (
    sprint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_points INT DEFAULT 0,
    completed_points INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned','active','closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);

-- 4) Tasks (board richer entity, affianca todos)
CREATE TABLE IF NOT EXISTS tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    column_id UUID REFERENCES board_columns(column_id) ON DELETE SET NULL,
    sprint_id UUID REFERENCES sprints(sprint_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'Media' CHECK (priority IN ('Bassa', 'Media', 'Alta')),
    story_points INT DEFAULT 0,
    start_date DATE,
    due_date DATE,
    position INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);

-- 5) Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
    subtask_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);

-- 6) Task assignees (many-to-many)
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON task_assignees(user_id);

-- 7) Time entries (timesheet)
CREATE TABLE IF NOT EXISTS time_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(task_id) ON DELETE SET NULL,
    hours NUMERIC(5,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
    entry_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);

-- 8) Activity feed
CREATE TABLE IF NOT EXISTS activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    type VARCHAR(40) NOT NULL,
    target_type VARCHAR(40),
    target_id UUID,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- 9) Chats e messaggi
CREATE TABLE IF NOT EXISTS chats (
    chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    name VARCHAR(120),
    is_group BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members (
    chat_id UUID REFERENCES chats(chat_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(chat_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at DESC);

-- 10) Trigger updated_at sulle nuove tabelle (riusa funzione esistente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_board_columns_updated_at') THEN
        CREATE TRIGGER update_board_columns_updated_at BEFORE UPDATE ON board_columns
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sprints_updated_at') THEN
        CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
        CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subtasks_updated_at') THEN
        CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_time_entries_updated_at') THEN
        CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chats_updated_at') THEN
        CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- 11) Seed colonne Kanban di default per progetti esistenti senza colonne
INSERT INTO board_columns (project_id, name, accent, position)
SELECT p.project_id, c.name, c.accent, c.position
FROM projects p
CROSS JOIN (VALUES
    ('In Progress',    'violet', 0),
    ('Ready to Design','cyan',   1),
    ('Final Review',   'pink',   2),
    ('Completed',      'emerald',3)
) AS c(name, accent, position)
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns bc WHERE bc.project_id = p.project_id
);
