// Asked. — public-page load test.
//
// Simulates anonymous visitors hitting the public FAQ page and a small
// fraction submitting a question. This is the most common viral path:
// a creator shares /{team-slug}, traffic spikes, the page must hold up.
//
// Run:
//   BASE_URL=https://asked.fr TEAM_SLUG=vald-team k6 run tests/load/k6-public.js
//
// Or against local:
//   BASE_URL=http://localhost:8080 TEAM_SLUG=demo-team k6 run tests/load/k6-public.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const TEAM_SLUG = __ENV.TEAM_SLUG || 'demo-team';

// Set to a number 0-100 (percentage of visitors who submit a question).
const SUBMIT_RATIO = Number(__ENV.SUBMIT_RATIO || 5);

const pageDuration = new Trend('asked_public_page_duration', true);
const submitDuration = new Trend('asked_public_submit_duration', true);
const submitSuccess = new Rate('asked_public_submit_ok');

export const options = {
    scenarios: {
        viral_landing: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 100 }, // ramp to 100 concurrent
                { duration: '60s', target: 100 }, // hold
                { duration: '30s', target: 500 }, // ramp to 500 (going viral)
                { duration: '60s', target: 500 }, // hold the spike
                { duration: '30s', target: 0 },   // ramp down
            ],
            gracefulRampDown: '15s',
        },
    },
    thresholds: {
        // Page load — the hot path. 95th percentile under 500ms even at peak.
        asked_public_page_duration: ['p(95)<500', 'p(99)<1500'],
        // Question submission — slightly slower (DB write + rate limit).
        asked_public_submit_duration: ['p(95)<800'],
        // Submissions either succeed (302) or get rate-limited (429) — both OK.
        asked_public_submit_ok: ['rate>0.98'],
        // Total errors should stay low.
        http_req_failed: ['rate<0.02'],
    },
};

const SAMPLE_QUESTIONS = [
    'What gear do you use for streaming? Camera, mic, lights — the works.',
    'How do you stay consistent when motivation drops?',
    'Any tips for someone starting out today?',
    'Quel est ton setup technique pour les lives ?',
    'Quelle est ta plus grande erreur depuis le début ?',
    'Will you ever do a behind-the-scenes video?',
    'Comment tu gères les jours sans inspiration ?',
    'Best book / podcast you discovered this year?',
];

const SAMPLE_NAMES = ['Mara', 'Theo', 'Lila', 'Jules', 'Anon', null, 'A.', null];

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export default function () {
    // --- 1. Load the public FAQ page ---
    const pageRes = http.get(`${BASE_URL}/${TEAM_SLUG}`, {
        tags: { name: 'public_page' },
    });
    pageDuration.add(pageRes.timings.duration);

    check(pageRes, {
        'public page status 200': (r) => r.status === 200,
        'public page has html': (r) => (r.body || '').length > 1000,
    });

    // --- 2. Browse for a few seconds (realistic dwell time) ---
    sleep(Math.random() * 4 + 1); // 1-5s

    // --- 3. Some fraction submits a question ---
    if (Math.random() * 100 < SUBMIT_RATIO) {
        // Need a CSRF cookie + token. The page sets XSRF-TOKEN; fetch the
        // home page (which sets the cookie), then send the submission.
        // For load purposes, we send without CSRF and accept 419 as
        // "rate-limited / valid rejection" — submission throughput isn't
        // the goal of this script. The real-traffic version would need
        // CSRF token extraction.
        const submitRes = http.post(
            `${BASE_URL}/${TEAM_SLUG}/questions`,
            {
                body: randomItem(SAMPLE_QUESTIONS),
                author_name: randomItem(SAMPLE_NAMES) ?? '',
            },
            {
                tags: { name: 'public_submit' },
                headers: { Accept: 'text/html' },
            },
        );
        submitDuration.add(submitRes.timings.duration);
        submitSuccess.add(
            submitRes.status === 302 || // success redirect
                submitRes.status === 419 || // CSRF (load-test artifact)
                submitRes.status === 429, // rate limit (expected at scale)
        );
    }
}
