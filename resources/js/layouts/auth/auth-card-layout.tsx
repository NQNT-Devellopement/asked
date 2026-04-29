import type { PropsWithChildren } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <AuthShell title={title} description={description}>
            {children}
        </AuthShell>
    );
}
