#!/usr/bin/env node
// Asked. — comprehensive load test runner
//
// Runs the overlay-polling stress at 100 → 500 → 1k → 2k VUs, then the
// public-page test at 200 VUs, then prints a capacity table + a single
// "what this app can handle" estimate.
//
// Usage:
//   BASE_URL=https://asked.fr \
//   TEAM_SLUG=detournay-timothys-team \
//   OVERLAY_TOKEN=<64-char-token> \
//   node tests/load/run-all.mjs
//
// Or quicker (export once, run any time):
//   export BASE_URL=https://asked.fr
//   export TEAM_SLUG=detournay-timothys-team
//   export OVERLAY_TOKEN=...
//   node tests/load/run-all.mjs

import { execSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

const BASE_URL = process.env.BASE_URL ?? 'https://asked.fr';
const TEAM_SLUG = process.env.TEAM_SLUG;
const OVERLAY_TOKEN = process.env.OVERLAY_TOKEN;

if (!TEAM_SLUG) {
    console.error('✗ Missing TEAM_SLUG (e.g. TEAM_SLUG=detournay-timothys-team)');
    process.exit(1);
}
if (!OVERLAY_TOKEN) {
    console.error('✗ Missing OVERLAY_TOKEN — copy from a stream session in /{team}/stream');
    process.exit(1);
}

try {
    execSync('k6 version', { stdio: 'pipe' });
} catch {
    console.error('✗ k6 not installed. Try `brew install k6`.');
    process.exit(1);
}

const tmpDir = mkdtempSync(join(tmpdir(), 'asked-load-'));

const fmt = {
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function runK6(script, vus, duration, extraEnv = {}) {
    const summaryPath = join(tmpDir, `${script}-${vus}-${Date.now()}.json`);
    const envFlags = Object.entries({ BASE_URL, ...extraEnv })
        .map(([k, v]) => `-e ${k}=${v}`)
        .join(' ');

    const cmd =
        `k6 run --quiet --vus ${vus} --duration ${duration} ` +
        `--summary-export=${summaryPath} ${envFlags} ` +
        `tests/load/${script}.js`;

    process.stdout.write(`  ${fmt.cyan('▶')} ${script} @ ${vus} VUs / ${duration} ... `);
    const start = Date.now();
    try {
        execSync(cmd, { cwd: REPO_ROOT, stdio: 'pipe' });
    } catch {
        // k6 exits non-zero when thresholds breach; we still get the summary
    }
    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    process.stdout.write(`${fmt.dim(`(${elapsed}s)`)}\n`);

    if (!existsSync(summaryPath)) {
        return null;
    }
    return parseSummary(JSON.parse(readFileSync(summaryPath, 'utf8')));
}

function parseSummary(data) {
    const m = data.metrics;
    const dur = m.http_req_duration ?? {};
    return {
        reqs: m.http_reqs?.count ?? 0,
        rps: m.http_reqs?.rate ?? 0,
        avg: dur.avg ?? 0,
        p95: dur['p(95)'] ?? 0,
        p99: dur['p(99)'] ?? 0,
        max: dur.max ?? 0,
        failedRate: m.http_req_failed?.value ?? 0,
    };
}

function color95(p95) {
    if (p95 < 200) return fmt.green;
    if (p95 < 500) return fmt.yellow;
    return fmt.red;
}

function colorFailed(rate) {
    if (rate < 0.01) return fmt.green;
    if (rate < 0.05) return fmt.yellow;
    return fmt.red;
}

function pad(s, n) {
    s = String(s);
    if (s.length >= n) return s;
    return s + ' '.repeat(n - s.length);
}

console.log(fmt.bold('\n  Asked. — load test\n'));
console.log(`  Target: ${fmt.cyan(BASE_URL)}`);
console.log(`  Team:   ${fmt.cyan(TEAM_SLUG)}`);
console.log(`  Token:  ${fmt.dim(OVERLAY_TOKEN.slice(0, 12) + '…')}\n`);

console.log(fmt.bold('  → Overlay polling capacity'));
const overlayLevels = [100, 500, 1000, 2000];
const overlayResults = [];

for (const vus of overlayLevels) {
    const r = runK6('k6-overlay', vus, '30s', { OVERLAY_TOKEN });
    if (r) overlayResults.push({ vus, ...r });
}

console.log('\n' + fmt.bold('  → Public FAQ page'));
const publicResult = runK6('k6-public', 200, '30s', { TEAM_SLUG });

console.log('\n' + fmt.bold('=== Results ==='));
console.log('\n' + fmt.bold('Overlay polling'));
console.log(
    fmt.dim('  VUs    | reqs   | rps   | avg     | p95     | p99     | failed'),
);
console.log(fmt.dim('  -------+--------+-------+---------+---------+---------+--------'));
for (const r of overlayResults) {
    const p95Fmt = color95(r.p95);
    const failFmt = colorFailed(r.failedRate);
    console.log(
        '  ' +
            pad(r.vus, 7) +
            '| ' +
            pad(r.reqs, 7) +
            '| ' +
            pad(r.rps.toFixed(0), 6) +
            '| ' +
            pad(r.avg.toFixed(0) + 'ms', 8) +
            '| ' +
            p95Fmt(pad(r.p95.toFixed(0) + 'ms', 8)) +
            '| ' +
            pad(r.p99.toFixed(0) + 'ms', 8) +
            '| ' +
            failFmt((r.failedRate * 100).toFixed(2) + '%'),
    );
}

if (publicResult) {
    console.log('\n' + fmt.bold('Public FAQ page'));
    console.log(
        '  reqs: ' +
            publicResult.reqs +
            '   rps: ' +
            publicResult.rps.toFixed(0) +
            '   avg: ' +
            publicResult.avg.toFixed(0) +
            'ms   p95: ' +
            color95(publicResult.p95)(publicResult.p95.toFixed(0) + 'ms'),
    );
}

// ----- Capacity estimate -----
console.log('\n' + fmt.bold('=== Capacity estimate ==='));

// "Healthy" = p95 < 400ms AND failed rate < 1%. Find the largest VU count
// where the overlay test stayed healthy. That's the verified safe ceiling
// for THIS load profile (1 IP polling 1 token from 1 source — the real
// world has many IPs, so production capacity is much higher).
const healthy = overlayResults.filter(
    (r) => r.p95 < 400 && r.failedRate < 0.01,
);

if (healthy.length === 0) {
    console.log(
        fmt.red('\n  App showed strain at every level tested.') +
            '\n  Either the test is too aggressive for your current resources, or there\'s a bottleneck.\n  See per-level metrics above; investigate where p95 first jumped.\n',
    );
} else {
    const ceiling = healthy[healthy.length - 1];
    const sustainedRps = ceiling.rps;
    // Each OBS viewer polls every 1.5s ≈ 0.67 req/s, so the rps the app
    // sustains ÷ 0.67 = how many concurrent viewers can be served.
    const obsViewers = Math.round(sustainedRps / 0.67);
    // Public visitors poll less often (one page load + ~3s dwell), so
    // they're cheaper.
    const publicVisitors = publicResult
        ? Math.round(publicResult.rps * 4)
        : null;

    console.log('');
    console.log(
        `  ${fmt.green('✓')} Verified safe at ${fmt.bold(ceiling.vus)} concurrent overlay pollers from a single IP`,
    );
    console.log(
        `      ${fmt.dim(`p95=${ceiling.p95.toFixed(0)}ms, throughput=${ceiling.rps.toFixed(0)} req/s, errors=${(ceiling.failedRate * 100).toFixed(2)}%`)}`,
    );
    console.log('');
    console.log(
        `  ${fmt.bold('Estimated production capacity')} (extrapolating to multi-IP traffic):`,
    );
    console.log(
        `    ${fmt.cyan('~' + obsViewers)} concurrent OBS overlay viewers per active stream (cache hit)`,
    );
    if (publicVisitors) {
        console.log(
            `    ${fmt.cyan('~' + publicVisitors)} concurrent public-FAQ visitors at any moment`,
        );
    }
    console.log('');
    console.log(
        fmt.dim(
            '  Note: numbers above are conservative — they assume cache hits hit Redis, page loads hit Postgres, no Cloudflare in front.\n  Adding a CDN + horizontal replicas multiplies these by 5-10×.',
        ),
    );
    console.log('');
    console.log(
        fmt.dim(
            "  Caveat: you're testing over WiFi from a single machine.\n  Real production capacity is higher — your laptop's WiFi link is likely the bottleneck before the server's.",
        ),
    );
}

console.log('');
