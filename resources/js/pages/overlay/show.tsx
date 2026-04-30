import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { BannerBottomPreset } from '@/components/overlay/banner-bottom-preset';
import { CardCornerPreset } from '@/components/overlay/card-corner-preset';
import { EditorialPreset } from '@/components/overlay/editorial-preset';
import { OverlayStyle } from '@/components/overlay/overlay-style';
import { QuotePreset } from '@/components/overlay/quote-preset';
import type {
    OverlayPhase,
    OverlayQuestion,
    OverlayTeam,
} from '@/components/overlay/types';
import { useTranslate } from '@/lib/i18n';

type OverlayPresetKey = 'editorial' | 'banner-bottom' | 'card-corner' | 'quote';

type OverlayShowProps = {
    preset: OverlayPresetKey | null;
    team: OverlayTeam;
    state: {
        current_question: OverlayQuestion | null;
        version: number;
    };
};

type OverlayStatePayload = {
    preset: OverlayPresetKey | null;
    team: OverlayTeam;
    current_question: OverlayQuestion | null;
    version: number;
};

const POLL_INTERVAL_MS = 1500;
const EXIT_ANIMATION_MS = 320;

/**
 * Public OBS browser-source overlay.
 *
 * Polls the matching `state.json` endpoint (relative to the current path) at
 * 1.5s intervals using `AbortController` to keep at most one request in
 * flight. When the version stamp changes, an `entered → exiting → entering`
 * lifecycle is driven via a single `phase` data attribute that each preset
 * reads to author its own CSS keyframes — no animation library needed.
 *
 * The page itself is a transparent canvas: when there is no current question
 * it renders nothing visible, letting the underlying scene show through OBS.
 */
export default function OverlayShow({
    preset,
    team: initialTeam,
    state: initialState,
}: OverlayShowProps) {
    const { t } = useTranslate();

    const [team, setTeam] = useState<OverlayTeam>(initialTeam);
    const [activePreset, setActivePreset] = useState<OverlayPresetKey>(
        preset ?? 'editorial',
    );

    // Display state. `displayed` is what the preset renders right now;
    // `phase` controls the lifecycle (entering / entered / exiting). When the
    // server reports a new question, we go through:
    //   entered → exiting → (swap) → entering → entered
    const [displayed, setDisplayed] = useState<OverlayQuestion | null>(
        initialState.current_question,
    );
    const [phase, setPhase] = useState<OverlayPhase>(
        initialState.current_question ? 'entered' : 'entering',
    );

    // Refs hold the live values consumed by the polling effect, so the effect
    // itself only needs to run once (on mount). Without these we'd tear down
    // and re-create the interval on every state update — an obvious 60fps
    // regression for an OBS browser source.
    const versionRef = useRef<number>(initialState.version);
    const displayedRef = useRef<OverlayQuestion | null>(
        initialState.current_question,
    );
    const activePresetRef = useRef<OverlayPresetKey>(preset ?? 'editorial');
    const pendingRef = useRef<OverlayQuestion | null>(null);
    const exitTimerRef = useRef<number | null>(null);

    // Keep refs in sync whenever the matching state changes. We do this in
    // a layout effect so the polling loop always sees the freshly committed
    // value before its next tick fires.
    useEffect(() => {
        displayedRef.current = displayed;
    }, [displayed]);

    useEffect(() => {
        activePresetRef.current = activePreset;
    }, [activePreset]);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        // Build the absolute state URL from the current pathname so the
        // overlay token (last URL segment) is preserved. Using a relative
        // 'state.json' resolves against the parent dir and drops the token.
        const stateUrl = `${window.location.pathname.replace(/\/+$/, '')}/state.json`;

        async function pollOnce(): Promise<void> {
            try {
                const response = await fetch(stateUrl, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as OverlayStatePayload;

                if (cancelled) {
                    return;
                }

                if (data.version === versionRef.current) {
                    return;
                }

                versionRef.current = data.version;

                setTeam(data.team);

                if (data.preset && data.preset !== activePresetRef.current) {
                    activePresetRef.current = data.preset;
                    setActivePreset(data.preset);
                }

                handleQuestionChange(data.current_question);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }
                // Swallow other transient errors — next tick will retry.
            }
        }

        function handleQuestionChange(next: OverlayQuestion | null): void {
            const nextId = next?.id ?? null;
            const currentId = displayedRef.current?.id ?? null;

            if (nextId === currentId) {
                return;
            }

            if (currentId === null) {
                // Nothing showing → enter directly.
                pendingRef.current = null;
                displayedRef.current = next;
                setDisplayed(next);
                setPhase('entering');
                window.requestAnimationFrame(() => {
                    if (cancelled) {
                        return;
                    }

                    setPhase('entered');
                });

                return;
            }

            // Something is showing → exit, then swap.
            pendingRef.current = next;
            setPhase('exiting');

            if (exitTimerRef.current !== null) {
                window.clearTimeout(exitTimerRef.current);
            }

            exitTimerRef.current = window.setTimeout(() => {
                if (cancelled) {
                    return;
                }

                const incoming = pendingRef.current;
                pendingRef.current = null;

                if (incoming === null) {
                    displayedRef.current = null;
                    setDisplayed(null);
                    setPhase('entering');

                    return;
                }

                displayedRef.current = incoming;
                setDisplayed(incoming);
                setPhase('entering');
                window.requestAnimationFrame(() => {
                    if (cancelled) {
                        return;
                    }

                    setPhase('entered');
                });
            }, EXIT_ANIMATION_MS);
        }

        const intervalId = window.setInterval(() => {
            void pollOnce();
        }, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            controller.abort();
            window.clearInterval(intervalId);

            if (exitTimerRef.current !== null) {
                window.clearTimeout(exitTimerRef.current);
                exitTimerRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <Head title={t('overlay.meta.title', { name: initialTeam.name })}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content={t('overlay.meta.description', {
                        name: initialTeam.name,
                    })}
                />
            </Head>

            <OverlayStyle />

            <div
                className="overlay-root pointer-events-none fixed inset-0 overflow-hidden"
                aria-live="polite"
                aria-atomic="true"
            >
                {displayed !== null
                    ? renderPreset(activePreset, displayed, team, phase)
                    : null}
            </div>
        </>
    );
}

function renderPreset(
    preset: OverlayPresetKey,
    question: OverlayQuestion,
    team: OverlayTeam,
    phase: OverlayPhase,
) {
    switch (preset) {
        case 'banner-bottom':
            return (
                <BannerBottomPreset
                    question={question}
                    team={team}
                    phase={phase}
                />
            );
        case 'card-corner':
            return (
                <CardCornerPreset
                    question={question}
                    team={team}
                    phase={phase}
                />
            );
        case 'quote':
            return (
                <QuotePreset question={question} team={team} phase={phase} />
            );
        case 'editorial':
        default:
            return (
                <EditorialPreset
                    question={question}
                    team={team}
                    phase={phase}
                />
            );
    }
}
