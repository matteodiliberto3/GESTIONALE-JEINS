/** Ruoli e helper RBAC centralizzati */

export const ADMIN_ROLES = ['Admin', 'IT'];

export const MANAGEMENT_ROLES = [
    'Responsabile',
    'CDA',
    'Presidente',
    'Tesoreria',
    'Audit',
    'Manager',
];

export const ALL_KNOWN_ROLES = [
    'Socio',
    ...ADMIN_ROLES,
    ...MANAGEMENT_ROLES,
    'Marketing',
    'Commerciale',
];

export function normalizeRole(role) {
    if (role === 'Manager') return 'Responsabile';
    return role;
}

export function isSocio(role) {
    return role === 'Socio';
}

export function isAdmin(role) {
    return ADMIN_ROLES.includes(role);
}

export function isManagement(role) {
    const r = normalizeRole(role);
    return MANAGEMENT_ROLES.includes(r) || MANAGEMENT_ROLES.includes(role);
}

export function isPrivileged(role) {
    return isAdmin(role) || isManagement(role);
}

/** Fatturato: area Commerciale o ruolo Tesoreria (+ Admin/IT per gestione sistema). */
export function canAccessBilling(user) {
    if (!user?.role) return false;
    if (isAdmin(user.role)) return true;
    if (user.role === 'Tesoreria') return true;
    if (user.area === 'Commerciale') return true;
    return false;
}

export function canManageClients(role) {
    return !isSocio(role) && isPrivileged(role);
}

export function canManageProjects(role) {
    return !isSocio(role) && isPrivileged(role);
}

/** @deprecated Preferire canAccessBilling(user) */
export function canManageContracts(role) {
    if (isSocio(role)) return false;
    return role === 'Tesoreria' || isAdmin(role);
}

export function canAccessClientInArea(user, clientArea) {
    if (isSocio(user.role)) return false;
    if (isPrivileged(user.role)) return true;
    if (!user.area) return false;
    return !clientArea || clientArea === user.area;
}

export function canAccessProjectInArea(user, projectArea) {
    if (isPrivileged(user.role)) return true;
    if (!user.area) return false;
    return !projectArea || projectArea === user.area;
}
