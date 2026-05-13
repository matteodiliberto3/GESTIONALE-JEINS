// Servizio API per comunicare con il backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Funzione helper per le chiamate API
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
            
            // Se il token è scaduto o non valido, rimuovilo e reindirizza al login
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            throw new Error(error.error || `Errore ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Errore API:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    login: (email: string, password: string) => 
        apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    
    register: (userData: any) =>
        apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
    
    verify: () =>
        apiCall('/api/auth/verify'),
};

// Clients API
export const clientsAPI = {
    getAll: () => apiCall('/api/clients'),
    getById: (id: string) => apiCall(`/api/clients/${id}`),
    create: (client: any) =>
        apiCall('/api/clients', {
            method: 'POST',
            body: JSON.stringify(client),
        }),
    update: (id: string, client: any) =>
        apiCall(`/api/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(client),
        }),
    updateStatus: (id: string, status: string) =>
        apiCall(`/api/clients/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    delete: (id: string) =>
        apiCall(`/api/clients/${id}`, {
            method: 'DELETE',
        }),
};

// Projects API
export const projectsAPI = {
    getAll: () => apiCall('/api/projects'),
    getById: (id: string) => apiCall(`/api/projects/${id}`),
    create: (project: any) =>
        apiCall('/api/projects', {
            method: 'POST',
            body: JSON.stringify(project),
        }),
    update: (id: string, project: any) =>
        apiCall(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(project),
        }),
    updateStatus: (id: string, status: string) =>
        apiCall(`/api/projects/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    delete: (id: string) =>
        apiCall(`/api/projects/${id}`, {
            method: 'DELETE',
        }),
    addTodo: (projectId: string, todo: any) =>
        apiCall(`/api/projects/${projectId}/todos`, {
            method: 'POST',
            body: JSON.stringify(todo),
        }),
    toggleTodo: (projectId: string, todoId: string) =>
        apiCall(`/api/projects/${projectId}/todos/${todoId}/toggle`, {
            method: 'PATCH',
        }),
    deleteTodo: (projectId: string, todoId: string) =>
        apiCall(`/api/projects/${projectId}/todos/${todoId}`, {
            method: 'DELETE',
        }),
};

// Contracts API
export const contractsAPI = {
    getAll: () => apiCall('/api/contracts'),
    getById: (id: string) => apiCall(`/api/contracts/${id}`),
    create: (contract: any) =>
        apiCall('/api/contracts', {
            method: 'POST',
            body: JSON.stringify(contract),
        }),
    update: (id: string, contract: any) =>
        apiCall(`/api/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contract),
        }),
    updateStatus: (id: string, status: string) =>
        apiCall(`/api/contracts/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    delete: (id: string) =>
        apiCall(`/api/contracts/${id}`, {
            method: 'DELETE',
        }),
};

// Events API
export const eventsAPI = {
    getAll: (filters: any = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.isCall !== undefined) params.append('isCall', filters.isCall);
        
        const query = params.toString();
        return apiCall(`/api/events${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => apiCall(`/api/events/${id}`),
    getParticipants: (id: string) => apiCall(`/api/events/${id}/participants`),
    getMyUpcoming: () => apiCall('/api/events/my/upcoming'),
    create: (event: any) =>
        apiCall('/api/events', {
            method: 'POST',
            body: JSON.stringify(event),
        }),
    update: (id: string, event: any) =>
        apiCall(`/api/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(event),
        }),
    delete: (id: string) =>
        apiCall(`/api/events/${id}`, {
            method: 'DELETE',
        }),
    rsvp: (id: string, status: string) =>
        apiCall(`/api/events/${id}/rsvp`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        }),
};

// Users API
export const usersAPI = {
    getAll: () => apiCall('/api/users'),
    getMe: () => apiCall('/api/users/me'),
    updateMe: (data: any) =>
        apiCall('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    getById: (id: string) => apiCall(`/api/users/${id}`),
};

// Tasks API (board / Kanban)
export const tasksAPI = {
    getAll: (filters: { projectId?: string; columnId?: string; sprintId?: string } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
        const q = params.toString();
        return apiCall(`/api/tasks${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => apiCall(`/api/tasks/${id}`),
    create: (task: any) =>
        apiCall('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id: string, task: any) =>
        apiCall(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
    move: (id: string, columnId: string, position?: number) =>
        apiCall(`/api/tasks/${id}/move`, {
            method: 'PATCH',
            body: JSON.stringify({ columnId, position }),
        }),
    delete: (id: string) =>
        apiCall(`/api/tasks/${id}`, { method: 'DELETE' }),
    addSubtask: (taskId: string, text: string, position = 0) =>
        apiCall(`/api/tasks/${taskId}/subtasks`, {
            method: 'POST', body: JSON.stringify({ text, position }),
        }),
    toggleSubtask: (taskId: string, subtaskId: string) =>
        apiCall(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`, { method: 'PATCH' }),
    deleteSubtask: (taskId: string, subtaskId: string) =>
        apiCall(`/api/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' }),
    addAssignee: (taskId: string, userId: string) =>
        apiCall(`/api/tasks/${taskId}/assignees`, {
            method: 'POST', body: JSON.stringify({ userId }),
        }),
    removeAssignee: (taskId: string, userId: string) =>
        apiCall(`/api/tasks/${taskId}/assignees/${userId}`, { method: 'DELETE' }),
    getColumns: (projectId: string) =>
        apiCall(`/api/tasks/columns/by-project/${projectId}`),
};

// Sprints API
export const sprintsAPI = {
    getAll: (filters: { projectId?: string; status?: string } = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
        const q = params.toString();
        return apiCall(`/api/sprints${q ? `?${q}` : ''}`);
    },
    getActive: (projectId?: string) =>
        apiCall(`/api/sprints/active${projectId ? `?projectId=${projectId}` : ''}`),
    create: (sprint: any) =>
        apiCall('/api/sprints', { method: 'POST', body: JSON.stringify(sprint) }),
    update: (id: string, sprint: any) =>
        apiCall(`/api/sprints/${id}`, { method: 'PUT', body: JSON.stringify(sprint) }),
    delete: (id: string) =>
        apiCall(`/api/sprints/${id}`, { method: 'DELETE' }),
};

// Activities API
export const activitiesAPI = {
    getAll: (filters: { projectId?: string; limit?: number } = {}) => {
        const params = new URLSearchParams();
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.limit) params.append('limit', String(filters.limit));
        const q = params.toString();
        return apiCall(`/api/activities${q ? `?${q}` : ''}`);
    },
    create: (activity: any) =>
        apiCall('/api/activities', { method: 'POST', body: JSON.stringify(activity) }),
};

// Time entries API
export const timeAPI = {
    getAll: (filters: any = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.append(k, String(v)));
        const q = params.toString();
        return apiCall(`/api/time-entries${q ? `?${q}` : ''}`);
    },
    summary: (period: 'week' | 'month' | 'year' = 'month') =>
        apiCall(`/api/time-entries/summary?period=${period}`),
    create: (entry: any) =>
        apiCall('/api/time-entries', { method: 'POST', body: JSON.stringify(entry) }),
    delete: (id: string) =>
        apiCall(`/api/time-entries/${id}`, { method: 'DELETE' }),
};

// Messages / Chat API
export const messagesAPI = {
    getChats: () => apiCall('/api/chats'),
    getMessages: (chatId: string) => apiCall(`/api/chats/${chatId}/messages`),
    sendMessage: (chatId: string, body: string) =>
        apiCall(`/api/chats/${chatId}/messages`, {
            method: 'POST', body: JSON.stringify({ body }),
        }),
    createChat: (data: { name?: string; projectId?: string; memberIds?: string[] }) =>
        apiCall('/api/chats', { method: 'POST', body: JSON.stringify(data) }),
};

