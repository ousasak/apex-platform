<?php

namespace Tests\Feature;

use App\Models\ApprovalRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacAndAdminTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;

    protected User $admin;

    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $superRole = Role::where('name', 'superadmin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $memberRole = Role::where('name', 'member')->first();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'super@example.com',
            'password' => Hash::make('password'),
            'role_id' => $superRole->id,
            'is_active' => true,
        ]);

        $this->admin = User::create([
            'name' => 'Regular Admin',
            'username' => 'regularadmin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $this->member = User::create([
            'name' => 'Regular Member',
            'username' => 'regularmember',
            'email' => 'member@example.com',
            'password' => Hash::make('password'),
            'role_id' => $memberRole->id,
            'is_active' => true,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_member_cannot_access_admin_dashboard(): void
    {
        Sanctum::actingAs($this->member);

        $response = $this->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Unauthorized. Admin access required.');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_cannot_access_superadmin_routes(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Unauthorized. Super Admin access required.');
    }

    public function test_superadmin_can_access_superadmin_routes(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_member_can_access_member_profile(): void
    {
        Sanctum::actingAs($this->member);

        $response = $this->getJson('/api/member/profile');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'member@example.com');
    }

    public function test_admin_mutation_interception_when_lacking_permission(): void
    {
        Sanctum::actingAs($this->admin);

        // Ensure this admin has NO permission on categories
        UserPermission::where('user_id', $this->admin->id)
            ->where('resource', 'categories')
            ->delete();

        // Attempt to create a category
        $response = $this->postJson('/api/admin/blog/categories', [
            'name' => 'Intercepted Category',
            'slug' => 'intercepted-category',
        ]);

        // Action should be intercepted and return HTTP 202
        $response->assertStatus(202)
            ->assertJsonPath('success', false)
            ->assertJsonPath('intercepted', true);

        // Verify an ApprovalRequest was created
        $this->assertDatabaseHas('approval_requests', [
            'requested_by' => $this->admin->id,
            'action' => 'create',
            'status' => 'pending',
        ]);
    }
}
