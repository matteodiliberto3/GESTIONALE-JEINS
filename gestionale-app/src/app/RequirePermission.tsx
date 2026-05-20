import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { defaultHomePath, resolvePermissions, type UserPermissions } from '../lib/permissions';

export function RequirePermission({
    perm,
    children,
}: {
    perm: keyof UserPermissions;
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    if (loading) return null;
    const permissions = resolvePermissions(user);
    if (!permissions[perm]) {
        return <Navigate to={defaultHomePath(user)} replace />;
    }
    return <>{children}</>;
}
