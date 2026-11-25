<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\ApprovalRequest;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Comment;
use App\Models\ContentCollection;
use App\Models\Doc;
use App\Models\DocCategory;
use App\Models\DocMenu;
use App\Models\DocSection;
use App\Models\Media;
use App\Models\Message;
use App\Models\Project;
use App\Models\Role;
use App\Models\Series;
use App\Models\Setting;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\UserPermission;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DynamicDataAndSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_populates_all_modules_and_is_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);

        $firstRunCounts = [
            'roles' => Role::count(),
            'settings' => Setting::count(),
            'users' => User::count(),
            'user_permissions' => UserPermission::count(),
            'team_members' => TeamMember::count(),
            'blog_categories' => BlogCategory::count(),
            'tags' => Tag::count(),
            'series' => Series::count(),
            'collections' => ContentCollection::count(),
            'projects' => Project::count(),
            'blog_posts' => BlogPost::count(),
            'comments' => Comment::count(),
            'doc_categories' => DocCategory::count(),
            'doc_menus' => DocMenu::count(),
            'docs' => Doc::count(),
            'doc_sections' => DocSection::count(),
            'applications' => Application::count(),
            'messages' => Message::count(),
            'media' => Media::count(),
            'approval_requests' => ApprovalRequest::count(),
            'activity_logs' => ActivityLog::count(),
            'notifications' => DB::table('notifications')->count(),
        ];

        foreach ($firstRunCounts as $table => $count) {
            $this->assertGreaterThan(0, $count, "Expected seeded records in {$table}");
        }

        // Verify key relational integrity
        $superAdmin = User::where('email', 'admin@apex.dev')->firstOrFail();
        $this->assertTrue($superAdmin->isSuperAdmin());

        $editor = User::where('email', 'editor@apex.dev')->firstOrFail();
        $this->assertTrue($editor->isAdmin());
        $this->assertFalse($editor->isSuperAdmin());

        $guest = User::where('email', 'guest@apex.dev')->firstOrFail();
        $this->assertSame('guest', $guest->role->name);

        // Every seeded project collection must belong to the same creator
        Project::whereNotNull('collection_id')->with('collection')->get()->each(function (Project $p) {
            $this->assertSame($p->created_by, $p->collection->author_id);
        });

        // Every seeded blog post series must belong to the same author
        BlogPost::whereNotNull('series_id')->with('series')->get()->each(function (BlogPost $post) {
            $this->assertSame($post->author_id, $post->series->author_id);
        });

        // Every team member is linked to a valid user
        TeamMember::all()->each(function (TeamMember $tm) {
            $this->assertNotNull($tm->user_id);
        });

        // Re-running DatabaseSeeder must not duplicate any records
        $this->seed(DatabaseSeeder::class);

        $secondRunCounts = [
            'roles' => Role::count(),
            'settings' => Setting::count(),
            'users' => User::count(),
            'user_permissions' => UserPermission::count(),
            'team_members' => TeamMember::count(),
            'blog_categories' => BlogCategory::count(),
            'tags' => Tag::count(),
            'series' => Series::count(),
            'collections' => ContentCollection::count(),
            'projects' => Project::count(),
            'blog_posts' => BlogPost::count(),
            'comments' => Comment::count(),
            'doc_categories' => DocCategory::count(),
            'doc_menus' => DocMenu::count(),
            'docs' => Doc::count(),
            'doc_sections' => DocSection::count(),
            'applications' => Application::count(),
            'messages' => Message::count(),
            'media' => Media::count(),
            'approval_requests' => ApprovalRequest::count(),
            'activity_logs' => ActivityLog::count(),
            'notifications' => DB::table('notifications')->count(),
        ];

        $this->assertSame($firstRunCounts, $secondRunCounts, 'Re-seeding produced duplicate or mismatched counts');
    }

    public function test_public_endpoints_return_real_dynamic_database_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $stats = $this->getJson('/api/stats')->assertStatus(200);
        $stats->assertJsonPath('success', true);
        $this->assertSame(TeamMember::where('is_visible', true)->count(), $stats->json('data.team_members'));
        $this->assertSame(Project::count(), $stats->json('data.projects'));
        $this->assertSame(BlogPost::where('status', 'published')->count(), $stats->json('data.blog_posts'));
        $this->assertSame(Doc::where('status', 'published')->count(), $stats->json('data.docs'));

        $this->getJson('/api/settings/public')
            ->assertStatus(200)
            ->assertJsonPath('data.site_name', 'APEX')
            ->assertJsonPath('data.founded_year', 2024);

        $this->getJson('/api/projects?tag=laravel&search=apex')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/api/blog/posts?search=laravel')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson('/api/docs/nav')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->getJson('/api/docs/introduction-to-apex')
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'introduction-to-apex');

        // Verify previously crashing public series endpoint now works
        $this->getJson('/api/users/rom_chamraeun/series/postgresql-backend-mastery')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.series.slug', 'postgresql-backend-mastery');

        $this->getJson('/api/users/khat_vanna/collections/apex-core-platform')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.collection.slug', 'apex-core-platform');
    }

    public function test_dashboard_stats_and_scoping_for_superadmin_vs_admin(): void
    {
        $this->seed(DatabaseSeeder::class);

        $superAdmin = User::where('email', 'admin@apex.dev')->firstOrFail();
        $editor = User::where('email', 'editor@apex.dev')->firstOrFail();

        $saResponse = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(200);

        $saData = $saResponse->json('data');
        $this->assertSame('global', $saData['scope']);
        $this->assertSame(User::count(), $saData['total_users']);
        $this->assertSame(Project::count(), $saData['total_projects']);
        $this->assertSame(BlogPost::where('status', 'published')->count(), $saData['total_blog_posts']);
        $this->assertCount(6, $saData['monthly_trends']);

        $adminResponse = $this->actingAs($editor, 'sanctum')
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(200);

        $adminData = $adminResponse->json('data');
        $this->assertSame('personal', $adminData['scope']);
        $this->assertSame(0, $adminData['total_users']);
        $this->assertSame(Project::where('created_by', $editor->id)->count(), $adminData['total_projects']);
        $this->assertSame(
            BlogPost::where('author_id', $editor->id)->where('status', 'published')->count(),
            $adminData['total_blog_posts']
        );

        // Activity endpoint includes description & target_type
        $activity = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/dashboard/activity')
            ->assertStatus(200)
            ->json('data');
        $this->assertNotEmpty($activity);
        $this->assertArrayHasKey('description', $activity[0]);
    }

    public function test_rbac_ownership_scoping_and_search_protection(): void
    {
        $this->seed(DatabaseSeeder::class);

        $superAdmin = User::where('email', 'admin@apex.dev')->firstOrFail();
        $editor = User::where('email', 'editor@apex.dev')->firstOrFail();
        $inactive = User::where('email', 'inactive@apex.dev')->firstOrFail();

        // Editor cannot view or delete SuperAdmin's project
        $superAdminProject = Project::where('created_by', $superAdmin->id)->firstOrFail();
        $this->actingAs($editor, 'sanctum')
            ->getJson("/api/admin/projects/{$superAdminProject->id}")
            ->assertStatus(403);
        $this->actingAs($editor, 'sanctum')
            ->deleteJson("/api/admin/projects/{$superAdminProject->id}")
            ->assertStatus(403);

        // Search hides users from regular admin, includes them for superadmin
        $adminSearch = $this->actingAs($editor, 'sanctum')
            ->getJson('/api/admin/search?q=apex')
            ->assertStatus(200);
        $this->assertArrayNotHasKey('users', $adminSearch->json('data'));

        $saSearch = $this->actingAs($superAdmin, 'sanctum')
            ->getJson('/api/admin/search?q=apex')
            ->assertStatus(200);
        $this->assertArrayHasKey('users', $saSearch->json('data'));
        $this->assertArrayHasKey('docs', $saSearch->json('data'));

        // Inactive user is rejected from admin routes even if role were admin
        $inactive->update(['role_id' => Role::where('name', 'admin')->value('id')]);
        $this->actingAs($inactive, 'sanctum')
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(403);

        // Superadmin cannot delete self or system role superadmin
        $this->actingAs($superAdmin, 'sanctum')
            ->deleteJson("/api/admin/users/{$superAdmin->id}")
            ->assertStatus(422);

        $superAdminRole = Role::where('name', 'superadmin')->firstOrFail();
        $this->actingAs($superAdmin, 'sanctum')
            ->putJson("/api/admin/roles/{$superAdminRole->id}", [
                'name' => 'renamed_role',
                'display_name' => 'Renamed',
            ])
            ->assertStatus(422);
    }

    public function test_approval_workflow_and_notifications(): void
    {
        $this->seed(DatabaseSeeder::class);

        $superAdmin = User::where('email', 'admin@apex.dev')->firstOrFail();
        $junior = User::where('email', 'junior.admin@apex.dev')->firstOrFail();

        $beforeCount = DB::table('notifications')->where('notifiable_id', $superAdmin->id)->count();

        // Junior admin lacks projects.can_create -> intercepted into approval_requests
        $this->actingAs($junior, 'sanctum')
            ->postJson('/api/admin/projects', [
                'title' => 'Queued Approval Project',
                'slug' => 'queued-approval-project',
                'description' => 'Testing approval interception and tech_stack preservation.',
                'tech_stack' => ['Laravel', 'React'],
                'status' => 'active',
            ])
            ->assertStatus(202)
            ->assertJsonPath('intercepted', true);

        $approval = ApprovalRequest::where('requested_by', $junior->id)
            ->where('subject_type', Project::class)
            ->where('status', 'pending')
            ->latest('id')
            ->firstOrFail();

        // Superadmin got notified
        $afterCount = DB::table('notifications')->where('notifiable_id', $superAdmin->id)->count();
        $this->assertGreaterThan($beforeCount, $afterCount);

        // Superadmin approves -> project created with proper array tech_stack (not double-JSON-encoded)
        $this->actingAs($superAdmin, 'sanctum')
            ->postJson("/api/admin/approval-requests/{$approval->id}/approve", ['note' => 'Looks good'])
            ->assertStatus(200);

        $created = Project::where('slug', 'queued-approval-project')->firstOrFail();
        $this->assertSame(['Laravel', 'React'], $created->tech_stack);
    }

    public function test_tag_logo_supports_url_and_file_upload(): void
    {
        $this->seed(DatabaseSeeder::class);
        Storage::fake('public');

        $superAdmin = User::where('email', 'admin@apex.dev')->firstOrFail();

        // Create tag with URL logo
        $urlRes = $this->actingAs($superAdmin, 'sanctum')
            ->postJson('/api/admin/tags', [
                'name' => 'Kotlin',
                'slug' => 'kotlin',
                'color' => '#7f52ff',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
            ])
            ->assertStatus(201);

        $tagId = $urlRes->json('data.id');
        $this->assertStringContainsString('kotlin-original.svg', $urlRes->json('data.logo'));

        // Update tag with uploaded image file
        $file = UploadedFile::fake()->create('kotlin-logo.svg', 10, 'image/svg+xml');
        $uploadRes = $this->actingAs($superAdmin, 'sanctum')
            ->post("/api/admin/tags/{$tagId}", [
                '_method' => 'PUT',
                'name' => 'Kotlin',
                'slug' => 'kotlin',
                'color' => '#7f52ff',
                'logo_file' => $file,
            ])
            ->assertStatus(200);

        $this->assertStringContainsString('/storage/tags/', $uploadRes->json('data.logo'));
    }
}
