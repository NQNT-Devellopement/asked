import { AuthShell } from '@/components/auth/auth-shell';
import type { AuthLayoutProps } from '@/types';

/**
 * Re-exports the shared editorial AuthShell for backwards compatibility with
 * any direct importer. The "simple", "card", and "split" variants converge on
 * the editorial lobby — there's only one front door.
 */
export default function AuthSimpleLayout({
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
