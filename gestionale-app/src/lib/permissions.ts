import type { User } from '../types/models';

export interface UserPermissions {
    isSocio: boolean;
    viewClients: boolean;
    manageClients: boolean;
    viewProjects: boolean;
    manageProjects: boolean;
    viewMyProjects: boolean;
    viewBilling: boolean;
    manageBilling: boolean;
    viewReports: boolean;
    viewInbox: boolean;
    viewDashboard: boolean;
    viewMyTasks: boolean;
    viewCalendar: boolean;
    markCallAttendance: boolean;
    updateOwnWork: boolean;
    manageEvents: boolean;
    manageUsers: boolean;
}

const ADMIN_ROLES = ['Admin', 'IT'];
const MANAGEMENT_ROLES = [
    'Responsabile', 'CDA', 'Presidente', 'Tesoreria', 'Audit', 'Manager',
];

function isPrivileged(role?: string) {
    if (!role) return false;
    return ADMIN_ROLES.includes(role) || MANAGEMENT_ROLES.includes(role);
}

function canAccessBilling(user: Pick<User, 'role' | 'area'>) {
    if (!user.role) return false;
    if (ADMIN_ROLES.includes(user.role)) return true;
    if (user.role === 'Tesoreria') return true;
    if (user.area === 'Commerciale') return true;
    return false;
}

/** Calcola permessi lato client (allineato a backend/lib/permissions.js). */
export function resolvePermissions(user: User | null | undefined): UserPermissions {
    if (user?.permissions) {
        return user.permissions as UserPermissions;
    }

    const socio = user?.role === 'Socio';
    const billing = user ? canAccessBilling(user) : false;
    const privileged = user?.role ? isPrivileged(user.role) : false;

    return {
        isSocio: !!socio,
        viewClients: !socio && privileged,
        manageClients: !socio && privileged,
        viewProjects: !socio && privileged,
        manageProjects: !socio && privileged,
        viewMyProjects: !!socio,
        viewBilling: billing,
        manageBilling: billing,
        viewReports: !socio && privileged,
        viewInbox: !socio && privileged,
        viewDashboard: !socio && privileged,
        viewMyTasks: true,
        viewCalendar: true,
        markCallAttendance: true,
        updateOwnWork: true,
        manageEvents: privileged,
        manageUsers: user?.role === 'Admin' || user?.role === 'IT' || user?.role === 'Responsabile',
    };
}

export function defaultHomePath(user: User | null | undefined): string {
    const p = resolvePermissions(user);
    return p.isSocio ? '/tasks' : '/dashboard';
}
