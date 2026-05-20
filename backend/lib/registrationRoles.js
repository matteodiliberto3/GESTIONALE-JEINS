import bcrypt from 'bcrypt';

const DEFAULT_ROLE = 'Socio';
const DEFAULT_ELEVATED_ROLE = 'CDA';

const ALLOWED_ELEVATED_ROLES = new Set([
    'CDA',
    'Responsabile',
    'Admin',
    'Presidente',
    'Manager',
]);

/**
 * Ruolo assegnato in registrazione.
 * - Senza managerCode → Socio
 * - Con managerCode valido (bcrypt vs env hash) → ELEVATED_REGISTRATION_ROLE (default CDA)
 * - Con managerCode non valido → errore
 *
 * @param {string | undefined} managerCode
 * @returns {Promise<{ role: string } | { error: string, status: number }>}
 */
export async function resolveRegistrationRole(managerCode) {
    const code = typeof managerCode === 'string' ? managerCode.trim() : '';

    if (!code) {
        return { role: DEFAULT_ROLE };
    }

    const hash = process.env.ELEVATED_REGISTRATION_CODE_HASH;
    if (!hash) {
        console.error('ELEVATED_REGISTRATION_CODE_HASH non configurato: registrazione elevata disabilitata');
        return { error: 'Registrazione con codice non disponibile', status: 503 };
    }

    const match = await bcrypt.compare(code, hash);
    if (!match) {
        return { error: 'Codice di accesso non valido', status: 403 };
    }

    const configured = (process.env.ELEVATED_REGISTRATION_ROLE || DEFAULT_ELEVATED_ROLE).trim();
    const role = ALLOWED_ELEVATED_ROLES.has(configured) ? configured : DEFAULT_ELEVATED_ROLE;

    return { role };
}
