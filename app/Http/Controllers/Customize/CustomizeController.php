<?php

namespace App\Http\Controllers\Customize;

use App\Enums\FaqBackground;
use App\Enums\FaqTemplate;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customize\UpdateCustomizationRequest;
use App\Models\Team;
use App\Rules\TeamName;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomizeController extends Controller
{
    /**
     * Show the customization editor for the current team's public FAQ page.
     */
    public function edit(Request $request, Team $current_team): Response
    {
        abort_unless(
            $request->user()?->hasTeamPermission($current_team, TeamPermission::CustomizePage),
            403,
        );

        return Inertia::render('customize/index', [
            'team' => [
                'name' => $current_team->name,
                'headline' => $current_team->headline,
                'tagline' => $current_team->tagline,
                'slug' => $current_team->slug,
                'template' => $current_team->template->value,
                'theme' => $current_team->getThemeWithDefaults(),
            ],
            'publicUrl' => route('faq.show', $current_team),
            'templates' => $this->templateOptions(),
            'backgrounds' => $this->backgroundOptions(),
        ]);
    }

    /**
     * Persist the chosen template and theme for the current team.
     */
    public function update(UpdateCustomizationRequest $request, Team $current_team): RedirectResponse
    {
        $payload = ['template' => $request->validated('template')];

        foreach (['name', 'headline', 'tagline'] as $field) {
            if ($request->has($field)) {
                $payload[$field] = $request->validated($field);
            }
        }

        if ($request->has('theme')) {
            $payload['theme'] = array_filter(
                [
                    'accent' => $request->validated('theme.accent'),
                    'background' => $request->validated('theme.background'),
                ],
                fn ($value) => $value !== null,
            );
        }

        $current_team->update($payload);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('customize.flash.updated')]);

        // Pass the freshly-updated team explicitly so the redirect URL uses
        // the new slug if the name changed and the slug regenerated.
        return to_route('customize.edit', $current_team->fresh());
    }

    /**
     * Preview the slug a given name would resolve to for the current team,
     * along with whether the desired base slug is free (i.e., not taken by
     * a different team). Powers the live availability indicator on the
     * customize form.
     */
    public function previewSlug(Request $request, Team $current_team): JsonResponse
    {
        abort_unless(
            $request->user()?->hasTeamPermission($current_team, TeamPermission::CustomizePage),
            403,
        );

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', new TeamName],
        ]);

        $name = $validated['name'];
        $baseSlug = Str::slug($name) ?: 'team';

        $finalSlug = Team::generateUniqueTeamSlug($name, $current_team->id);

        // Available when the requested base slug equals what we'd actually
        // assign — i.e., no other team already holds it. Renaming the team
        // back to its current name is always treated as available.
        $available = $baseSlug === $finalSlug;

        return response()->json([
            'baseSlug' => $baseSlug,
            'finalSlug' => $finalSlug,
            'available' => $available,
            'unchanged' => $finalSlug === $current_team->slug,
        ]);
    }

    /**
     * Build the template option list for the customization page.
     *
     * @return array<int, array{key: string, label: string, description: string}>
     */
    protected function templateOptions(): array
    {
        $descriptions = [
            FaqTemplate::Minimal->value => 'Single editorial column. Reading-first.',
            FaqTemplate::Grid->value => 'Two-column card grid for visual scanners.',
            FaqTemplate::Timeline->value => 'Vertical timeline by date answered.',
        ];

        return collect(FaqTemplate::cases())
            ->map(fn (FaqTemplate $template): array => [
                'key' => $template->value,
                'label' => $template->label(),
                'description' => $descriptions[$template->value],
            ])
            ->values()
            ->all();
    }

    /**
     * Build the background option list for the customization page.
     *
     * @return array<int, array{key: string, label: string, description: string}>
     */
    protected function backgroundOptions(): array
    {
        $descriptions = [
            FaqBackground::Cream->value => 'Warm off-white. Default.',
            FaqBackground::Ink->value => 'Deep navy. Soft contrast.',
            FaqBackground::Paper->value => 'Crisp neutral white.',
            FaqBackground::Noir->value => 'Pure black. Editorial.',
        ];

        return collect(FaqBackground::cases())
            ->map(fn (FaqBackground $background): array => [
                'key' => $background->value,
                'label' => $background->label(),
                'description' => $descriptions[$background->value],
            ])
            ->values()
            ->all();
    }
}
