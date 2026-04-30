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
     * same stream collapse to ~1 DB read per second instead of N. The cache
     * miss path also opportunistically updates `last_polled_at` (so writes
     * happen at most once/sec per token rather than once per poll).
     *
     * Token validation runs OUTSIDE the cache so an invalid / inactive
     * session always 404s and never caches a "live" payload it shouldn't.
     */
    public function state(string $token): JsonResponse
    {
        $session = $this->resolveSession($token);

        $payload = Cache::remember(
            "overlay-state:{$token}",
            now()->addSecond(),
            function () use ($session): array {
                $session->loadMissing(['team', 'currentQuestion.questionList:id,name,color']);

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
