import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/query/client';
import { ThemeProvider } from '../theme/ThemeProvider';
import { NoticeProvider } from './NoticeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <NoticeProvider>{children}</NoticeProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
