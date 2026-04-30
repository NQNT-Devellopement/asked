// Asked. — overlay polling stress test.
//
// Simulates N concurrent OBS browser-source viewers polling the overlay
// state JSON every 1.5s. This is the highest-volume endpoint when a
// streamer goes live: 1 streamer × 1000 viewers × 1 poll/1.5s = 666 req/s.
//
// The endpoint is cached for 1s by token (see OverlayController::state),
// so even with thousands of pollers the DB only sees ~1 request/sec per
// stream. This script verifies the cache holds up under fire.
//
// Run (you need an active StreamSession first — create one in the UI and
// copy its secret token from the control panel):
//
//   BASE_URL=https://asked.fr OVERLAY_TOKEN=<64-char-token> k6 run tests/load/k6-overlay.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OVERLAY_TOKEN = __ENV.OVERLAY_TOKEN;
const POLL_INTERVAL_MS = Number(__ENV.POLL_INTERVAL_MS || 1500);

if (!OVERLAY_TOKEN) {
    throw new Error(
        'OVERLAY_TOKEN env var required. Open the control panel of an active stream session and copy its secret token.',
    );
}

const stateDuration = new Trend('asked_overlay_state_duration', true);
const stateOk = new Rate('asked_overlay_state_ok');

export const options = {
    scenarios: {
        viewers: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 200 },   // warm up
                { duration: '60s', target: 1000 },  // 1k concurrent viewers
                { duration: '60s', target: 1000 },  // hold
                { duration: '60s', target: 5000 },  // 5k stress (10k easily on a beefy box)
                { duration: '60s', target: 5000 },  // hold the stress
                { duration: '30s', target: 0 },     // cool down
            ],
            gracefulRampDown: '15s',
        },
    },
    thresholds: {
        // The cache hit path should be sub-100ms. Cache miss (1/sec) up to ~300ms.
        asked_overlay_state_duration: ['p(95)<150', 'p(99)<400'],
        asked_overlay_state_ok: ['rate>0.99'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const res = http.get(
        `${BASE_URL}/overlay/${OVERLAY_TOKEN}/state.json`,
        {
            tags: { name: 'overlay_state' },
            headers: { Accept: 'application/json' },
        },
    );

    stateDuration.add(res.timings.duration);
    stateOk.add(res.status === 200);

    check(res, {
        'state status 200': (r) => r.status === 200,
        'state has json shape': (r) => {
            try {
                const parsed = r.json();
                return (
                    typeof parsed === 'object' &&
                    parsed !== null &&
                    'preset' in parsed &&
                    'version' in parsed
                );
            } catch {
                return false;
            }
        },
    });

    // Real OBS clients poll every 1.5s. Sleep approx that long.
    sleep(POLL_INTERVAL_MS / 1000);
}
