import { Globe, Twitch, Youtube } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type FaqPlatform =
    | 'youtube'
    | 'twitch'
    | 'twitter'
    | 'tiktok'
    | 'instagram'
    | 'spotify'
    | 'website';

type IconProps = {
    className?: string;
};

function TwitterIcon({ className }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function TikTokIcon({ className }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.4a8.16 8.16 0 0 0 4.77 1.52V6.5a4.79 4.79 0 0 1-1.84-.18z" />
        </svg>
    );
}

function InstagramIcon({ className }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={className}
        >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
    );
}

function SpotifyIcon({ className }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 0 1-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34a.75.75 0 0 1 .25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.99-8.16-2.57-11.98-1.4a.94.94 0 1 1-.55-1.8c4.37-1.34 9.81-.69 13.51 1.6a.94.94 0 0 1 .31 1.29zm.13-3.4c-3.87-2.3-10.27-2.51-13.97-1.39a1.13 1.13 0 1 1-.66-2.16c4.25-1.29 11.32-1.04 15.78 1.61a1.13 1.13 0 1 1-1.15 1.94z" />
        </svg>
    );
}

const ICON_MAP: Record<
    FaqPlatform,
    ComponentType<SVGProps<SVGSVGElement> & IconProps>
> = {
    youtube: Youtube,
    twitch: Twitch,
    twitter: TwitterIcon,
    tiktok: TikTokIcon,
    instagram: InstagramIcon,
    spotify: SpotifyIcon,
    website: Globe,
};

const PLATFORM_LABEL: Record<FaqPlatform, string> = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    twitter: 'X',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    spotify: 'Spotify',
    website: 'the web',
};

type Props = {
    platform: FaqPlatform;
    className?: string;
};

export function PlatformIcon({ platform, className }: Props) {
    const Icon = ICON_MAP[platform];

    return <Icon className={className} aria-hidden="true" />;
}

export function platformLabel(platform: FaqPlatform): string {
    return PLATFORM_LABEL[platform];
}
