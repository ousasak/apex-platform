<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Project;
use App\Models\Role;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_endpoint_returns_json(): void
    {
        $response = $this->getJson('/');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'name',
                'version',
            ]);
    }

    public function test_public_tags_endpoint(): void
    {
        Tag::create(['name' => 'Laravel', 'slug' => 'laravel', 'color' => '#FF2D20']);
        Tag::create(['name' => 'Vue', 'slug' => 'vue', 'color' => '#42B883']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_public_team_endpoint(): void
    {
        TeamMember::create([
            'name' => 'Kimleng',
            'title' => 'Lead Engineer',
            'is_visible' => true,
            'display_order' => 1,
        ]);

        TeamMember::create([
            'name' => 'Hidden Member',
            'title' => 'Tester',
            'is_visible' => false,
            'display_order' => 2,
        ]);

        $response = $this->getJson('/api/team');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_public_projects_endpoint(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $user = User::create([
            'name' => 'Author',
            'username' => 'author_user',
            'email' => 'author@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole?->id,
        ]);

        Project::create([
            'title' => 'APEX Platform',
            'slug' => 'apex-platform',
            'description' => 'A clean architecture platform',
            'status' => 'completed',
            'created_by' => $user->id,
        ]);

        $response = $this->getJson('/api/projects');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_public_blog_categories_and_posts(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $user = User::create([
            'name' => 'Author',
            'username' => 'author_user_2',
            'email' => 'author2@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole?->id,
        ]);

        $cat = BlogCategory::create([
            'name' => 'Tutorials',
            'slug' => 'tutorials',
        ]);

        BlogPost::create([
            'title' => 'Laravel 13 Upgrade Guide',
            'slug' => 'laravel-13-upgrade-guide',
            'excerpt' => 'A short summary of Laravel 13 upgrade.',
            'content' => 'Full migration guide to Laravel 13.',
            'status' => 'published',
            'author_id' => $user->id,
            'category_id' => $cat->id,
            'published_at' => now(),
        ]);

        // Categories
        $catResponse = $this->getJson('/api/blog/categories');
        $catResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Posts
        $postsResponse = $this->getJson('/api/blog/posts');
        $postsResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
