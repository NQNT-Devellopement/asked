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
     * Bust the per-team `pendingCount` cache when a question is written or
     * deleted in a way that affects the count. The cache key is the same one
     * read by `HandleInertiaRequests::share()` for the sidebar badge.
     */
    protected static function booted(): void
    {
        $bust = function (Question $question): void {
            // `getOriginal('status')` is the pre-write value; `status` (cast)
            // is the post-write value. Either side touching `Pending` means
            // the cached count is stale.
            $original = $question->getOriginal('status');
            $current = $question->status;

            $pendingValue = QuestionStatus::Pending->value;

            $touchesPending = $question->wasRecentlyCreated
                || $current === QuestionStatus::Pending
                || $original === QuestionStatus::Pending
                || $original === $pendingValue;

            if (! $touchesPending) {
                return;
            }

            // `team_id` may change in pathological cases (e.g. moving a
            // question between teams) — invalidate both sides if it did.
            $teamIds = array_unique(array_filter([
                $question->team_id,
                $question->getOriginal('team_id'),
            ]));

            foreach ($teamIds as $teamId) {
                Cache::forget("team:{$teamId}:pendingCount");
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
