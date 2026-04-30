import { ArrowUpRight, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Props = {
    url: string;
    /** Visual density. Compact omits the description and the "Open" link. */
    density?: 'default' | 'compact';
};

/**
 * Editorial "receipt" for the secret OBS Browser Source URL. The URL is
 * what the streamer pastes into OBS — display it monospace, give it a
 * one-press Copy button, and warn that it's password-grade.
 */
export function OverlayUrlField({ url, density = 'default' }: Props) {
    const { t } = useTranslate();
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            toast.error(t('stream.toast.no_clipboard'));

            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success(t('stream.toast.url_copied'));
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error(t('stream.toast.failed'));
        }
    };

    const displayUrl = url.replace(/^https?:\/\//, '');

    return (
        <div className="flex flex-col gap-2.5">
            {density === 'default' ? (
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    <span
                        aria-hidden="true"
                        className="inline-block size-1.5 rounded-full bg-[var(--accent-ink)]"
                    />
                    {t('stream.show.overlay_eyebrow')}
                </div>
            ) : null}

            <div
                className={cn(
                    'flex items-center gap-2 rounded-md border border-foreground/15 bg-background/80',
                    'px-3 py-2.5 font-mono text-[11px] tracking-tight text-foreground',
                )}
            >
                <span className="truncate">{displayUrl}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onCopy}
                    className={cn(
                        'inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                        'bg-foreground px-4 py-1.5 font-mono text-[10px] tracking-[0.22em] text-background uppercase',
                        'transition-transform hover:-translate-y-0.5',
                    )}
                >
                    {copied ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                    )}
                    {copied
                        ? t('common.actions.copied')
                        : t('stream.actions.copy_overlay_url')}
                </button>
                {density === 'default' ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'group inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                            'border border-foreground/20 px-4 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase',
                            'transition-[border-color,color] hover:border-foreground/45 hover:text-foreground',
                        )}
                    >
                        {t('stream.show.overlay_open')}
                        <ArrowUpRight
                            className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                            aria-hidden="true"
                        />
                    </a>
                ) : null}
            </div>

            {density === 'default' ? (
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                    {t('stream.show.overlay_help')}
                </p>
            ) : null}
        </div>
    );
}
