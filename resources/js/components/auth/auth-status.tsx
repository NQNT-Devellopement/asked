/**
 * Soft saffron-accent banner for Fortify flash status messages on auth pages.
 */
export function AuthStatus({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-md border border-[var(--accent-ink)]/30 bg-[var(--accent-ink)]/8 px-4 py-3"
        >
            <span
                aria-hidden="true"
                className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--accent-ink)]"
            />
            <p className="font-display text-sm leading-relaxed text-foreground/85">
                {message}
            </p>
        </div>
    );
}
