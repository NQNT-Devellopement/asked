<?php

namespace App\Models;

use App\Enums\OverlayPreset;
use App\Enums\QuestionStatus;
use Database\Factories\StreamSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

#[Fillable([
    'team_id',
    'created_by_user_id',
    'name',
    'secret_token',
    'list_id',
    'current_question_id',
    'skipped_question_ids',
    'overlay_preset',
    'is_active',
    'last_polled_at',
])]
class StreamSession extends Model
{
    /** @use HasFactory<StreamSessionFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (StreamSession $session): void {
            if (empty($session->secret_token)) {
                $session->secret_token = Str::random(64);
            }
        });

        // Bust the overlay JSON cache when the streamer mutates anything that
        // affects what viewers see. We exclude `last_polled_at` because the
        // cache miss path itself bumps that timestamp — invalidating on it
        // would defeat the cache.
        static::saved(function (StreamSession $session): void {
            $relevant = ['current_question_id', 'overlay_preset', 'is_active'];
            if ($session->wasChanged($relevant) && ! empty($session->secret_token)) {
                Cache::forget("overlay-state:{$session->secret_token}");
            }
        });

        // Hard delete + soft delete also bust the cache so a deactivated
        // session can't keep serving its last live payload.
        static::deleted(function (StreamSession $session): void {
            if (! empty($session->secret_token)) {
                Cache::forget("overlay-state:{$session->secret_token}");
            }
        });
    }

    /**
     * Get the team that owns the stream session.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user that created the stream session.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the question list this session is bound to (optional).
     *
     * @return BelongsTo<QuestionList, $this>
     */
    public function list(): BelongsTo
    {
        return $this->belongsTo(QuestionList::class, 'list_id');
    }

    /**
     * Get the question currently being shown by the overlay.
     *
     * @return BelongsTo<Question, $this>
     */
    public function currentQuestion(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'current_question_id');
    }

    /**
     * Get the questions addressed during this session, newest first.
     *
     * @return HasMany<Question, $this>
     */
    public function addressedQuestions(): HasMany
    {
        return $this->hasMany(Question::class, 'addressed_in_session_id')
            ->orderByDesc('addressed_at');
    }

    /**
     * Pick the next approved question from the session's source pool.
     *
     * Excludes the current question, any skipped question ids, and any
     * non-approved questions. Ordering follows list position when bound to
     * a list, otherwise by creation time ascending.
     */
    public function pickNext(): ?Question
    {
        return $this->candidatesQuery()->first();
    }

    /**
     * Count the questions remaining in the candidates pool.
     */
    public function countCandidatesRemaining(): int
    {
        return $this->candidatesQuery()->count();
    }

    /**
     * Build the base query for candidate questions for this session.
     *
     * @return Builder<Question>
     */
    public function candidatesQuery()
    {
        $skipped = collect($this->skipped_question_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->all();

        $query = Question::query()
            ->where('team_id', $this->team_id)
            ->where('status', QuestionStatus::Approved->value);

        if ($this->list_id !== null) {
            $query->where('question_list_id', $this->list_id)->orderBy('position');
        } else {
            $query->orderBy('created_at');
        }

        if ($this->current_question_id !== null) {
            $query->where('id', '!=', $this->current_question_id);
        }

        if (! empty($skipped)) {
            $query->whereNotIn('id', $skipped);
        }

        return $query;
    }

    /**
     * Generate and persist a new secret token for the public overlay URL.
     */
    public function regenerateToken(): void
    {
        $this->secret_token = Str::random(64);
        $this->save();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'skipped_question_ids' => 'array',
            'is_active' => 'boolean',
            'last_polled_at' => 'datetime',
            'overlay_preset' => OverlayPreset::class,
        ];
    }
}
