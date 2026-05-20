import { Navigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../app/AuthProvider';

export function LoginPage() {
    const { isAuthenticated, loading, login } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-surface text-ink-muted">
                Caricamento…
            </div>
        );
    }

    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    return (
        <Login
            onLoginSuccess={async (user, token) => {
                if (token) localStorage.setItem('token', token);
                await login(user);
            }}
        />
    );
}
