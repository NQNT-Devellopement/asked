<?php

namespace App\Models;

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use Database\Factories\QuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

#[Fillable([
    'team_id',
    'question_list_id',
    'addressed_in_session_id',
    'addressed_at',
    'author_name',
    'body',
    'status',
    'answer_source_type',
    'answer_source_url',
    'answer_source_label',
    'answered_at',
    'position',
    'submitter_ip_hash',
])]
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory;

    /**
     * Bust two per-team caches on writes:
     *   - `team:{id}:pendingCount` — the sidebar badge count, cached 10s
     *     in `HandleInertiaRequests::share()`.
     *   - `team:{id}:public-faq` — the public FAQ page payload, cached 30s
     *     in `PublicFaqController::show()`.
     *
     * The `team_id` may change in pathological cases (e.g. moving a question
     * between teams) — invalidate both sides if it did.
     */
    protected static function booted(): void
    {
        $bust = function (Question $question): void {
            $teamIds = array_unique(array_filter([
                $question->team_id,
                $question->getOriginal('team_id'),
            ]));

            $original = $question->getOriginal('status');
            $current = $question->status;
            $pendingValue = QuestionStatus::Pending->value;

            $touchesPending = $question->wasRecentlyCreated
                || $current === QuestionStatus::Pending
                || $original === QuestionStatus::Pending
                || $original === $pendingValue;

            // For the public-faq cache, any visible-state transition matters
            // (Approved/Answered shows; Pending/Hidden/Rejected doesn't), and
            // edits to the body/order of an already-visible question also
            // matter. Cheap to be conservative — just bust on every write.
            foreach ($teamIds as $teamId) {
                if ($touchesPending) {
                    Cache::forget("team:{$teamId}:pendingCount");
                }

                Cache::forget("team:{$teamId}:public-faq");
            }
        };

        static::saved($bust);
        static::deleted($bust);
    }

    /**
     * Get the team that owns the question.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the question list this question belongs to.
     *
     * @return BelongsTo<QuestionList, $this>
     */
    public function questionList(): BelongsTo
    {
        return $this->belongsTo(QuestionList::class);
    }

    /**
     * Get the stream session in which this question was addressed (if any).
     *
     * @return BelongsTo<StreamSession, $this>
     */
    public function addressedInSession(): BelongsTo
    {
        return $this->belongsTo(StreamSession::class, 'addressed_in_session_id');
    }

    /**
     * Determine if the question is visible to the public.
     */
    public function isPubliclyVisible(): bool
    {
        return in_array($this->status, [QuestionStatus::Approved, QuestionStatus::Answered], true);
    }

    /**
     * Scope a query to only include publicly visible questions.
     *
     * @param  Builder<Question>  $query
     */
    public function scopePubliclyVisible(Builder $query): void
    {
        $query
            ->whereIn('status', [QuestionStatus::Approved->value, QuestionStatus::Answered->value])
            ->orderByDesc('created_at');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => QuestionStatus::class,
            'answer_source_type' => AnswerSourcePlatform::class,
            'answered_at' => 'datetime',
            'addressed_at' => 'datetime',
        ];
    }
}
