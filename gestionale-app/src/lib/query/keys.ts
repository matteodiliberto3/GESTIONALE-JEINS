export const queryKeys = {
    me: ['users', 'me'] as const,
    clients: ['clients'] as const,
    client: (id: string) => ['clients', id] as const,
    projects: ['projects'] as const,
    project: (id: string) => ['projects', id] as const,
    contracts: ['contracts'] as const,
    tasks: (filters: Record<string, string | undefined>) => ['tasks', filters] as const,
    taskColumns: (projectId: string) => ['tasks', 'columns', projectId] as const,
    myTasks: ['tasks', 'my'] as const,
    events: (filters: Record<string, string | undefined>) => ['events', filters] as const,
    users: ['users'] as const,
    activities: (filters: Record<string, string | number | undefined>) =>
        ['activities', filters] as const,
};
