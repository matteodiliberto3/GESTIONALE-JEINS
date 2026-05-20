import Calendar from '../components/Calendar';
import { useAuth } from '../app/AuthProvider';

export function CalendarPage() {
    const { user } = useAuth();
    return <Calendar currentUser={user} />;
}
