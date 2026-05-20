import {
    isAdmin,
    isPrivileged,
    isSocio,
    canAccessBilling,
} from './roles.js';

/**
 * Permessi effettivi per l'utente (allineati a regole business JEINS).
 * I soci: presenze call, propri lavori/scadenze. Fatturato: Commerciale + Tesoreria.
 */
export function getPermissionsForUser(user) {
    const socio = isSocio(user.role);
    const billing = canAccessBilling(user);
    const privileged = isPrivileged(user.role) || isAdmin(user.role);

    return {
        isSocio: socio,
        viewClients: !socio && privileged,
        manageClients: !socio && privileged,
        viewProjects: !socio && privileged,
        manageProjects: !socio && privileged,
        viewMyProjects: socio,
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
        manageUsers: isAdmin(user.role) || user.role === 'IT' || user.role === 'Responsabile',
    };
}

export function requirePermission(permissionKey) {
    return (req, res, next) => {
        const perms = getPermissionsForUser(req.user);
        if (!perms[permissionKey]) {
            return res.status(403).json({
                error: 'Accesso negato. Permessi insufficienti per questa operazione.',
            });
        }
        next();
    };
}
