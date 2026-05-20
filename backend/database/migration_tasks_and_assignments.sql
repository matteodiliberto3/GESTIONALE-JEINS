-- Migration: Sistema Tasks e Assegnazioni Progetti (idempotente)

CREATE TABLE IF NOT EXISTS project_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Schema legacy (description + status) — solo se la tabella tasks non esiste ancora
CREATE TABLE IF NOT EXISTS tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Da Fare' CHECK (status IN ('Da Fare', 'In Corso', 'Completato', 'In Revisione')),
    priority VARCHAR(20) DEFAULT 'Media' CHECK (priority IN ('Bassa', 'Media', 'Alta')),
    assigned_to_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'title'
    ) THEN
        RAISE NOTICE 'Schema tasks kanban già presente: skip migrazione dati da todos';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'todos'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'description'
    ) THEN
        INSERT INTO tasks (project_id, description, status, priority, created_at, updated_at)
        SELECT project_id, text,
               CASE WHEN completed = TRUE THEN 'Completato' ELSE 'Da Fare' END,
               priority, created_at, updated_at
        FROM todos t
        WHERE NOT EXISTS (
            SELECT 1 FROM tasks k
            WHERE k.project_id = t.project_id AND k.description = t.text
        );
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Migrazione todos saltata';
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_id ON project_assignments(user_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assigned_to_user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_user_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    END IF;
END $$;

-- Trigger updated_at: gestito da migration_add_version o schema base se presente
