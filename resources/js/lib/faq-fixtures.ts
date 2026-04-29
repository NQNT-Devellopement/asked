import type { FaqQuestion } from '@/components/faq/question-card';

/**
 * Synthetic question set for the customize preview only. Mirrors the shape
 * a real `QuestionPresenter` returns so the actual template components can
 * render without backend data. Kept short, varied across statuses, platforms,
 * authors, and lengths so all three templates have something interesting to
 * show.
 */
export const PREVIEW_QUESTIONS: FaqQuestion[] = [
    {
        id: 1,
        body: 'What setup do you use to record the morning lectures? Mic, lighting, room treatment — all of it.',
        authorName: 'Mara K.',
        status: 'answered',
        answerSource: {
            url: 'https://www.youtube.com/watch?v=demo',
            label: 'Walked through it on the channel',
            platform: 'youtube',
        },
        list: { name: 'Gear', color: '#c97a2b' },
        answeredAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    },
    {
        id: 2,
        body: 'Is there a chance you cover the new rendering pipeline soon? I keep seeing it on Twitter.',
        authorName: null,
        status: 'answered',
        answerSource: {
            url: 'https://x.com/example/status/0',
            label: 'Quick thread on it',
            platform: 'twitter',
        },
        list: null,
        answeredAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 4,
        ).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
        id: 3,
        body: 'Honestly — how do you stay consistent? I burn out every two weeks.',
        authorName: 'Anon',
        status: 'answered',
        answerSource: {
            url: 'https://example.com/blog/staying-consistent',
            label: 'Wrote it up',
            platform: 'website',
        },
        list: { name: 'Process', color: '#2563a8' },
        answeredAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 9,
        ).toISOString(),
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 10,
        ).toISOString(),
    },
    {
        id: 4,
        body: 'Any chance of a Twitch stream where you debug live? I learn the most watching real failures.',
        authorName: 'Theo',
        status: 'answered',
        answerSource: {
            url: 'https://www.twitch.tv/example/videos',
            label: 'Did it live last Friday',
            platform: 'twitch',
        },
        list: { name: 'Streams', color: '#7a2c8a' },
        answeredAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 16,
        ).toISOString(),
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 17,
        ).toISOString(),
    },
    {
        id: 5,
        body: 'When are you going to drop the playlist of every track from last season?',
        authorName: 'Lila',
        status: 'approved',
        answerSource: null,
        list: { name: 'Music', color: '#1f5f4d' },
        answeredAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
        id: 6,
        body: 'What does a typical Tuesday look like for you?',
        authorName: null,
        status: 'approved',
        answerSource: null,
        list: null,
        answeredAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
];
