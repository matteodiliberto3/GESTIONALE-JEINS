import MyTasks from '../components/MyTasks';
import { useAuth } from '../app/AuthProvider';

export function MyTasksPage() {
    const { user } = useAuth();
    if (!user) return null;
    return <MyTasks user={user} />;
}
