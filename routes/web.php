<?php

use App\Http\Controllers\Customize\CustomizeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Faq\PublicFaqController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Questions\QuestionController;
use App\Http\Controllers\Questions\QuestionListController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('docs', 'docs/index')->name('docs.index');

Route::patch('locale', [LocaleController::class, 'update'])
    ->middleware('throttle:locale-switch')
    ->name('locale.update');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::prefix('questions')->name('questions.')->group(function () {
            Route::get('inbox', [QuestionController::class, 'inbox'])->name('inbox');
            Route::get('/', [QuestionController::class, 'board'])->name('board');

            Route::patch('{question}/moderate', [QuestionController::class, 'moderate'])->name('moderate');
            Route::patch('{question}/answer', [QuestionController::class, 'answer'])->name('answer');
            Route::delete('{question}/answer', [QuestionController::class, 'unanswer'])->name('unanswer');
            Route::delete('{question}', [QuestionController::class, 'destroy'])->name('destroy');
            Route::post('reorder', [QuestionController::class, 'reorder'])->name('reorder');

            Route::post('lists', [QuestionListController::class, 'store'])->name('lists.store');
            Route::patch('lists/{list}', [QuestionListController::class, 'update'])->name('lists.update');
            Route::delete('lists/{list}', [QuestionListController::class, 'destroy'])->name('lists.destroy');
            Route::post('lists/reorder', [QuestionListController::class, 'reorder'])->name('lists.reorder');
        });

        Route::get('customize', [CustomizeController::class, 'edit'])->name('customize.edit');
        Route::patch('customize', [CustomizeController::class, 'update'])->name('customize.update');
        Route::get('customize/preview-slug', [CustomizeController::class, 'previewSlug'])
            ->middleware('throttle:slug-preview')
            ->name('customize.preview-slug');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';

Route::get('{team:slug}', [PublicFaqController::class, 'show'])->name('faq.show');
Route::post('{team:slug}/questions', [PublicFaqController::class, 'storeQuestion'])
    ->middleware('throttle:faq-submit')
    ->name('faq.questions.store');
