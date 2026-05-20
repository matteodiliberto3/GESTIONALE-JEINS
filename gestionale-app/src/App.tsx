import { AppProviders } from './app/providers';
import { AuthProvider } from './app/AuthProvider';
import { AppRoutes } from './app/router';

export default function App() {
    return (
        <AppProviders>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </AppProviders>
    );
}
