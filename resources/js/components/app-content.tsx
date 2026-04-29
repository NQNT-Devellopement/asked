import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({
    variant = 'sidebar',
    className,
    children,
    ...props
}: Props) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset
                {...props}
                className={cn(
                    'relative bg-transparent !shadow-none md:!m-0 md:!rounded-none',
                    className,
                )}
            >
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className={cn(
                'relative mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4',
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
