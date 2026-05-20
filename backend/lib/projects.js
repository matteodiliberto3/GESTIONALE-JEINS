import pool from '../database/connection.js';

/** Carica todos per più progetti in una query (evita N+1). */
export async function attachTodosToProjects(projects) {
    if (!projects.length) return [];

    const ids = projects.map((p) => p.id);
    const todosResult = await pool.query(
        `SELECT todo_id as id, project_id as "projectId", text, completed, priority,
                created_at as "createdAt"
         FROM todos
         WHERE project_id = ANY($1::uuid[])
         ORDER BY created_at ASC`,
        [ids],
    );

    const byProject = new Map();
    for (const todo of todosResult.rows) {
        const list = byProject.get(todo.projectId) || [];
        list.push(todo);
        byProject.set(todo.projectId, list);
    }

    return projects.map((p) => ({
        ...p,
        todos: byProject.get(p.id) || [],
    }));
}
