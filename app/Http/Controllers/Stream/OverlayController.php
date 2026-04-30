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
     * Cached by token for 1s. Under heavy load, when the entry expires up to
     * one request per FPM worker may briefly stampede the DB query, but the
     * lookup is indexed (secret_token) and Postgres handles the burst — we
     * tried Cache::flexible's stale-while-revalidate but the extra Redis
     * round-trips (lock + read + created-marker write) made things slower
     * under real load than a plain remember() with a tiny TTL.
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
