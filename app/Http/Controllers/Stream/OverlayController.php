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
     * The payload is cached by token for 1 second so that N viewers of the
     * same stream collapse to ~1 DB read per second instead of N. We cache
     * the entire branch (including the session lookup) so cache hits never
     * touch Postgres at all — important when 1k+ viewers poll the same
     * stream simultaneously.
     *
     * 404s are also cached (as `null`) for 1s — keeps a flood of bad-token
     * requests from hammering the DB.
     */
    public function state(string $token): JsonResponse
    {
        $payload = Cache::remember(
            "overlay-state:{$token}",
            now()->addSecond(),
            function () use ($token): ?array {
                $session = StreamSession::query()
                    ->where('secret_token', $token)
                    ->where('is_active', true)
                    ->with(['team', 'currentQuestion.questionList:id,name,color'])
                    ->first();

                if ($session === null) {
                    return null;
                }

                // Bump last_polled_at on cache miss only (i.e., at most once
                // per second per token), not on every poll.
                $session->forceFill(['last_polled_at' => now()])->saveQuietly();

                return [
                    'preset' => $session->overlay_preset?->value,
                    'team' => [
                        'name' => $session->team->name,
                        'slug' => $session->team->slug,
                    ],
                    'current_question' => $session->currentQuestion
                        ? QuestionPresenter::toArray($session->currentQuestion)
                        : null,
                    'version' => $this->stateVersion($session),
                ];
            },
        );

        abort_if($payload === null, 404);

        return response()->json($payload);
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
