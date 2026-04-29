import { AuthShell } from '@/components/auth/auth-shell';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <AuthShell title={title} description={description}>
            {children}
        </AuthShell>
    );
}
