import AdminPanel from '../components/AdminPanel';
import { useAuth } from '../app/AuthProvider';

/** Pannello dev: mock API e diagnostica (solo development). */
export function AdminPage() {
    const { user } = useAuth();

    if (import.meta.env.PROD) {
        return (
            <div className="card p-6">
                <p className="text-ink-muted">Pannello amministratore non disponibile in produzione.</p>
            </div>
        );
    }
    return <AdminPanel user={user!} />;
}
