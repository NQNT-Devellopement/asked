<?php

namespace App\Http\Controllers\Stream;

use App\Http\Controllers\Controller;
use App\Models\StreamSession;
use App\Support\QuestionPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OverlayController extends Controller
{
    /**
     * Render the public overlay page (used as an OBS Browser Source).
     */
    public function show(string $token): InertiaResponse
    {
        $session = $this->resolveSession($token);

        $session->forceFill(['last_polled_at' => now()])->saveQuietly();

        $session->loadMissing(['team', 'currentQuestion.questionList:id,name,color']);

        return Inertia::render('overlay/show', [
            'preset' => $session->overlay_preset?->value,
            'team' => [
                'name' => $session->team->name,
                'slug' => $session->team->slug,
            ],
            'state' => [
                'current_question' => $session->currentQuestion
                    ? QuestionPresenter::toArray($session->currentQuestion)
                    : null,
                'version' => $this->stateVersion($session),
            ],
        ]);
    }

    /**
     * Return the current overlay state as JSON. Polled by the overlay client
     * roughly every 1.5 seconds.
     *
     * The payload is cached by token using a stale-while-revalidate window so
     * that N viewers of the same stream collapse to ~1 DB read per second
     * instead of N. With `Cache::flexible([1, 3], …)`:
     *   - 0–1s after fill: serve cached value directly.
     *   - 1–3s after fill: serve cached (stale) value AND queue a background
     *     refresh under an atomic lock so only ONE worker recomputes — this
     *     is the cache stampede protection for 1k+ concurrent pollers.
     *   - 3s+ after fill: behave like remember() and recompute synchronously.
     *
     * 404s are cached too — keeps a flood of bad-token requests from hammering
     * the DB. We cannot cache `null` directly because Cache::flexible treats
     * `null` as a cache miss sentinel, so we wrap the result in an array shape
     * `['hit' => bool, 'payload' => array|null]`.
     */
    public function state(string $token): JsonResponse
    {
        /** @var array{hit: bool, payload: array<string, mixed>|null} $cached */
        $cached = Cache::flexible(
            "overlay-state:{$token}",
            [1, 3],
            function () use ($token): array {
                $session = StreamSession::query()
                    ->where('secret_token', $token)
                    ->where('is_active', true)
                    ->with(['team', 'currentQuestion.questionList:id,name,color'])
                    ->first();

                if ($session === null) {
                    return ['hit' => false, 'payload' => null];
                }

                // Bump last_polled_at on cache (re)compute only — at most a
                // handful of times per second per token, not on every poll.
                $session->forceFill(['last_polled_at' => now()])->saveQuietly();

                return [
                    'hit' => true,
                    'payload' => [
                        'preset' => $session->overlay_preset?->value,
                        'team' => [
                            'name' => $session->team->name,
                            'slug' => $session->team->slug,
                        ],
                        'current_question' => $session->currentQuestion
                            ? QuestionPresenter::toArray($session->currentQuestion)
                            : null,
                        'version' => $this->stateVersion($session),
                    ],
                ];
            },
        );

        abort_if($cached['hit'] === false, 404);

        return response()->json($cached['payload']);
    }

    /**
     * Resolve the session by secret token, aborting 404 if missing or inactive.
     */
    protected function resolveSession(string $token): StreamSession
    {
        $session = StreamSession::query()
            ->where('secret_token', $token)
            ->where('is_active', true)
            ->first();

        abort_if($session === null, 404);

        return $session;
    }

    /**
     * Build a monotonically increasing integer version stamp the client can
     * compare against to detect state changes.
     */
    protected function stateVersion(StreamSession $session): int
    {
        $sessionStamp = $session->updated_at?->getTimestamp() ?? 0;
        $questionStamp = $session->currentQuestion?->updated_at?->getTimestamp() ?? 0;

        return max($sessionStamp, $questionStamp);
    }
}
