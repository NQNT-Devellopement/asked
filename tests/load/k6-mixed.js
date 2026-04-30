// Asked. — realistic mixed load.
//
// Combines public-page traffic + overlay polling at realistic ratios.
// Closest to "what happens when a creator goes live and shares the page":
// the overlay viewers swamp polling, and a smaller crowd visits the public
// FAQ page; a tiny fraction submits new questions.
//
// Run:
//   BASE_URL=https://asked.fr TEAM_SLUG=vald-team OVERLAY_TOKEN=<token> \
//     k6 run tests/load/k6-mixed.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const TEAM_SLUG = __ENV.TEAM_SLUG || 'demo-team';
const OVERLAY_TOKEN = __ENV.OVERLAY_TOKEN;

if (!OVERLAY_TOKEN) {
    throw new Error('OVERLAY_TOKEN env var required.');
}

const pageDuration = new Trend('asked_page_duration', true);
const stateDuration = new Trend('asked_state_duration', true);
const allOk = new Rate('asked_all_ok');

export const options = {
    scenarios: {
        // Most users are watching the stream — they hit the overlay endpoint.
        overlay_viewers: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 500 },
                { duration: '60s', target: 2000 },
                { duration: '120s', target: 2000 },
                { duration: '30s', target: 0 },
            ],
            gracefulRampDown: '15s',
            exec: 'pollOverlay',
        },
        // Some fraction also visit the public FAQ page.
        public_visitors: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50 },
                { duration: '60s', target: 200 },
                { duration: '120s', target: 200 },
                { duration: '30s', target: 0 },
            ],
            gracefulRampDown: '15s',
            exec: 'visitPublic',
        },
    },
    thresholds: {
        asked_page_duration: ['p(95)<600'],
        asked_state_duration: ['p(95)<150'],
        asked_all_ok: ['rate>0.98'],
        http_req_failed: ['rate<0.02'],
    },
};

export function pollOverlay() {
    const res = http.get(
        `${BASE_URL}/overlay/${OVERLAY_TOKEN}/state.json`,
        { tags: { name: 'overlay_state' } },
    );
    stateDuration.add(res.timings.duration);
    allOk.add(res.status === 200);
    sleep(1.5);
}

export function visitPublic() {
    const res = http.get(`${BASE_URL}/${TEAM_SLUG}`, {
        tags: { name: 'public_page' },
    });
    pageDuration.add(res.timings.duration);
    allOk.add(res.status === 200);
    check(res, { 'public page 200': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2);
}
