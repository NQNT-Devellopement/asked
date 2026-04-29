<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('guests are redirected to login', function () {
    $team = Team::factory()->create();

    $this->get(route('customize.edit', $team))
        ->assertRedirect(route('login'));
});

test('a member without CustomizePage permission cannot view the edit page', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('customize.edit', $team))
        ->assertForbidden();
});

test('an admin without CustomizePage permission cannot view the edit page', function () {
    $team = Team::factory()->create();
    $admin = User::factory()->create();
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this->actingAs($admin)
        ->get(route('customize.edit', $team))
        ->assertForbidden();
});

test('a member without CustomizePage permission cannot update', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->patch(route('customize.update', $team), [
            'template' => 'grid',
        ])
        ->assertForbidden();
});

test('an admin without CustomizePage permission cannot update', function () {
    $team = Team::factory()->create();
    $admin = User::factory()->create();
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this->actingAs($admin)
        ->patch(route('customize.update', $team), [
            'template' => 'grid',
        ])
        ->assertForbidden();
});

test('an owner sees the edit page with current template, theme, and options', function () {
    $team = Team::factory()->create([
        'template' => 'grid',
        'theme' => ['accent' => '#112233', 'background' => 'ink'],
    ]);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->get(route('customize.edit', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customize/index')
            ->where('team.slug', $team->slug)
            ->where('team.template', 'grid')
            ->where('team.theme.accent', '#112233')
            ->where('team.theme.background', 'ink')
            ->where('publicUrl', route('faq.show', $team))
            ->has('templates', 3)
            ->where('templates.0.key', 'minimal')
            ->where('templates.0.label', 'Minimal')
            ->has('templates.0.description')
            ->has('backgrounds', 4)
            ->where('backgrounds.0.key', 'cream')
        );
});

test('the edit page falls back to default theme when none has been set', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->get(route('customize.edit', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('team.template', 'minimal')
            ->where('team.theme.accent', '#d97706')
            ->where('team.theme.background', 'cream')
        );
});

test('an owner can update the template and theme', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'timeline',
            'theme' => [
                'accent' => '#ABCDEF',
                'background' => 'noir',
            ],
        ])
        ->assertRedirect(route('customize.edit', $team));

    $fresh = $team->fresh();

    expect($fresh->template->value)->toEqual('timeline');
    expect($fresh->theme)->toEqual([
        'accent' => '#ABCDEF',
        'background' => 'noir',
    ]);
});

test('an invalid template value is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'spaceship',
        ])
        ->assertSessionHasErrors('template');
});

test('an invalid hex accent color is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'minimal',
            'theme' => [
                'accent' => 'red',
                'background' => 'cream',
            ],
        ])
        ->assertSessionHasErrors('theme.accent');

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'minimal',
            'theme' => [
                'accent' => '#abc',
                'background' => 'cream',
            ],
        ])
        ->assertSessionHasErrors('theme.accent');
});

test('an invalid background value is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'minimal',
            'theme' => [
                'accent' => '#112233',
                'background' => 'rainbow',
            ],
        ])
        ->assertSessionHasErrors('theme.background');
});

test('an owner can update name, headline, and tagline alongside the layout', function () {
    $team = Team::factory()->create(['name' => 'Original Name']);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'name' => 'Studio Felicity',
            'headline' => 'Ask Felicity',
            'tagline' => 'Live answers, in stream and on tape.',
            'template' => 'minimal',
        ])
        ->assertRedirect(route('customize.edit', ['current_team' => 'studio-felicity']));

    $fresh = $team->fresh();

    expect($fresh->name)->toEqual('Studio Felicity');
    expect($fresh->slug)->toEqual('studio-felicity');
    expect($fresh->headline)->toEqual('Ask Felicity');
    expect($fresh->tagline)->toEqual('Live answers, in stream and on tape.');
});

test('blank headline and tagline persist as null', function () {
    $team = Team::factory()->create([
        'headline' => 'Existing headline',
        'tagline' => 'Existing tagline',
    ]);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'headline' => null,
            'tagline' => null,
            'template' => 'minimal',
        ])
        ->assertRedirect(route('customize.edit', $team));

    $fresh = $team->fresh();

    expect($fresh->headline)->toBeNull();
    expect($fresh->tagline)->toBeNull();
});

test('headline longer than 80 chars is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'minimal',
            'headline' => str_repeat('a', 81),
        ])
        ->assertSessionHasErrors('headline');
});

test('tagline longer than 280 chars is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'template' => 'minimal',
            'tagline' => str_repeat('b', 281),
        ])
        ->assertSessionHasErrors('tagline');
});

test('renaming the team redirects to the new slug URL', function () {
    $team = Team::factory()->create([
        'name' => 'Original Name',
        'slug' => 'original-name',
    ]);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->patch(route('customize.update', $team), [
            'name' => 'Studio Felicity',
            'template' => 'minimal',
        ])
        ->assertRedirect(route('customize.edit', ['current_team' => 'studio-felicity']));

    expect($team->fresh()->slug)->toEqual('studio-felicity');
});

test('preview-slug returns availability for a fresh name', function () {
    $team = Team::factory()->create(['name' => 'Original Name']);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->getJson(route('customize.preview-slug', $team).'?name=Studio Felicity')
        ->assertOk()
        ->assertJson([
            'baseSlug' => 'studio-felicity',
            'finalSlug' => 'studio-felicity',
            'available' => true,
            'unchanged' => false,
        ]);
});

test('preview-slug flags the slug as taken when another team owns it', function () {
    Team::factory()->create(['name' => 'Studio Felicity', 'slug' => 'studio-felicity']);

    $team = Team::factory()->create(['name' => 'Original Name']);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $response = $this->actingAs($owner)
        ->getJson(route('customize.preview-slug', $team).'?name=Studio Felicity')
        ->assertOk()
        ->assertJson([
            'baseSlug' => 'studio-felicity',
            'available' => false,
            'unchanged' => false,
        ]);

    expect($response->json('finalSlug'))->toStartWith('studio-felicity-');
});

test('preview-slug treats the current team name as available (rename to itself)', function () {
    $team = Team::factory()->create(['name' => 'Felicity Mainwaring', 'slug' => 'felicity-mainwaring']);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->getJson(route('customize.preview-slug', $team).'?name=Felicity Mainwaring')
        ->assertOk()
        ->assertJson([
            'baseSlug' => 'felicity-mainwaring',
            'finalSlug' => 'felicity-mainwaring',
            'available' => true,
            'unchanged' => true,
        ]);
});

test('preview-slug requires CustomizePage permission', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->getJson(route('customize.preview-slug', $team).'?name=Anything')
        ->assertForbidden();
});

test('preview-slug is throttled after 60 requests per minute', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    for ($i = 0; $i < 60; $i++) {
        $this->actingAs($owner)
            ->getJson(route('customize.preview-slug', $team).'?name=Studio Felicity')
            ->assertOk();
    }

    $this->actingAs($owner)
        ->getJson(route('customize.preview-slug', $team).'?name=Studio Felicity')
        ->assertStatus(429);
});

test('preview-slug falls back to "team" base slug for non-slugifiable names', function () {
    $team = Team::factory()->create(['name' => 'Original Name']);
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $response = $this->actingAs($owner)
        ->getJson(route('customize.preview-slug', $team).'?name='.urlencode('🙂🙂🙂'))
        ->assertOk()
        ->assertJson([
            'baseSlug' => 'team',
        ]);

    expect($response->json('finalSlug'))->toBeString();
    expect($response->json('finalSlug'))->toMatch('/^team(-\d+)?$/');
});

test('a team can be created with a non-slugifiable name and gets a valid fallback slug', function () {
    $team = Team::factory()->create(['name' => '🙂🙂🙂', 'slug' => null]);

    expect($team->slug)->toMatch('/^team(-\d+)?$/');
});

test('a second team with a non-slugifiable name receives a suffixed slug', function () {
    Team::factory()->create(['name' => '🙂🙂🙂', 'slug' => null]);
    $second = Team::factory()->create(['name' => '🌟🌟🌟', 'slug' => null]);

    expect($second->slug)->toMatch('/^team-\d+$/');
});

test('an owner of a different team cannot edit another team', function () {
    $myTeam = Team::factory()->create();
    $owner = User::factory()->create();
    $myTeam->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();

    $this->actingAs($owner)
        ->get(route('customize.edit', $otherTeam))
        ->assertForbidden();

    $this->actingAs($owner)
        ->patch(route('customize.update', $otherTeam), [
            'template' => 'grid',
        ])
        ->assertForbidden();
});
