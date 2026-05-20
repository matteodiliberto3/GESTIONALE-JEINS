import { useOutletContext } from 'react-router-dom';
import { DashboardView } from '../components/dashboard/DashboardView';
import type { User } from '../types/models';

export function DashboardPage() {
    const { activeProjectId, user } = useOutletContext<{
        activeProjectId: string | null;
        user: User | null;
    }>();

    return (
        <DashboardView activeProjectId={activeProjectId} currentUser={user} />
    );
}
