import {
    canManageClients,
    canManageProjects,
    canAccessBilling,
    isPrivileged,
    isSocio,
} from '../lib/roles.js';

export function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(401).json({ error: 'Autenticazione richiesta' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }
        next();
    };
}

export function requirePrivileged(req, res, next) {
    if (!req.user?.role) {
        return res.status(401).json({ error: 'Autenticazione richiesta' });
    }
    if (!isPrivileged(req.user.role)) {
        return res.status(403).json({ error: 'Accesso negato. Permessi insufficienti.' });
    }
    next();
}

export function requireClientWrite(req, res, next) {
    if (!req.user?.role) return res.status(401).json({ error: 'Autenticazione richiesta' });
    if (!canManageClients(req.user.role)) {
        return res.status(403).json({ error: 'Non puoi modificare i clienti' });
    }
    next();
}

export function requireProjectWrite(req, res, next) {
    if (!req.user?.role) return res.status(401).json({ error: 'Autenticazione richiesta' });
    if (!canManageProjects(req.user.role)) {
        return res.status(403).json({ error: 'Non puoi modificare i progetti' });
    }
    next();
}

export function requireContractWrite(req, res, next) {
    if (!req.user?.role) return res.status(401).json({ error: 'Autenticazione richiesta' });
    if (!canAccessBilling(req.user)) {
        return res.status(403).json({ error: 'Non puoi modificare contratti o fatture' });
    }
    next();
}

export function requireNotSocio(req, res, next) {
    if (!req.user?.role) return res.status(401).json({ error: 'Autenticazione richiesta' });
    if (isSocio(req.user.role)) {
        return res.status(403).json({ error: 'Operazione non consentita per il ruolo Socio' });
    }
    next();
}
