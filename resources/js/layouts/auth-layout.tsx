import type { ReactNode } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';

type Props = {
    title?: string;
    description?: string;
    children: ReactNode;
};

export default function AuthLayout({ title, description, children }: Props) {
    return (
        <AuthShell title={title} description={description}>
            {children}
        </AuthShell>
    );
}
