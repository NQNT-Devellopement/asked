# Load tests — k6

Three [k6](https://k6.io) scripts that exercise the hot paths of Asked. under sustained load. Run them locally first against `docker compose up` to get a baseline, then point at production once you trust the numbers.

## Install k6

```bash
# macOS
brew install k6

# Or run via Docker (no install needed)
alias k6='docker run --rm -i grafana/k6 run -'
# then: k6 < tests/load/k6-public.js
```

## Scripts

### `k6-public.js` — viral-landing simulation

Anonymous visitors loading the public FAQ page, with ~5% submitting a question. Ramps to 500 concurrent VUs over a few minutes.

```bash
BASE_URL=https://asked.fr \
TEAM_SLUG=your-team-slug \
k6 run tests/load/k6-public.js
```

Optional: `SUBMIT_RATIO=10` to bump the question-submission percentage.

### `k6-overlay.js` — OBS overlay polling stress

The most concerning endpoint: overlay viewers polling state.json every 1.5s. Validates the in-memory cache (1s TTL by token) holds against thousands of concurrent pollers.

You need an **active StreamSession** first:
1. Log in, create a stream session via the control panel.
2. Copy the session's overlay URL — the last 64 chars are the token.

```bash
BASE_URL=https://asked.fr \
OVERLAY_TOKEN=<64-char-token> \
k6 run tests/load/k6-overlay.js
```

The script ramps to 5000 concurrent virtual viewers. Cache hits should respond in p95 < 150ms.

### `k6-mixed.js` — realistic combined load

Two parallel scenarios: 2000 overlay pollers + 200 public-page visitors. Closest to a "creator just went live and shared the page" traffic profile.

```bash
BASE_URL=https://asked.fr \
TEAM_SLUG=your-team-slug \
OVERLAY_TOKEN=<64-char-token> \
k6 run tests/load/k6-mixed.js
```

## Reading the output

k6 prints a summary at the end. Look for:

- **`http_req_duration`** — overall latency. p95 / p99 are the ones to watch.
- **`asked_*_duration`** — per-endpoint latency (defined in each script).
- **`http_req_failed`** — error rate. Should stay under 1-2%.
- **`vus`** — concurrent virtual users at any moment.
- **Threshold lines** with ✓ or ✗ — defined per script in the `options.thresholds` block. Anything red = the corresponding limit was breached.

## Recommended progression

1. **Baseline locally** — `docker compose up --build`, run `k6-overlay.js` with 1000 VUs against `localhost:8080`. Establishes the per-instance ceiling.
2. **Production warm-up** — same script against `asked.fr`, but cap VUs at 100-200 for the first run. Watch for 502s, 504s, slow timings.
3. **Stress test** — once warm-up is clean, go up to the script's full ramp.
4. **Mixed test** — `k6-mixed.js` for the realistic combined profile.

## Be a good citizen

The scripts default to fairly aggressive ramps. Against your own production:

- Run during off-peak.
- Watch the Dokploy / Traefik logs in parallel.
- Have a way to stop (`Ctrl+C` aborts the script gracefully).
- Don't run from a single tiny VPS — k6 itself can be CPU-bound; use a workstation or a dedicated load generator.

If you don't own the deployed instance, **don't run this**. It will look indistinguishable from a DDoS attempt.
