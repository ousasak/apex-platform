<?php

namespace Tests\Unit;

use App\Enums\ApplicationStatus;
use App\Enums\ApprovalStatus;
use App\Enums\ProjectStatus;
use App\Enums\PublishStatus;
use App\Enums\RoleName;
use App\Models\BlogPost;
use App\Models\Media;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class ArchitectureLayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_backed_enums_expose_expected_values(): void
    {
        $this->assertSame(['superadmin', 'admin', 'member'], RoleName::values());
        $this->assertSame(['admin', 'superadmin'], RoleName::adminRoles());
        $this->assertSame(['active', 'wip', 'archived'], ProjectStatus::values());
        $this->assertSame(['draft', 'published', 'archived'], PublishStatus::values());
        $this->assertSame(['draft', 'published'], PublishStatus::docValues());
        $this->assertSame(['pending', 'reviewing', 'accepted', 'rejected'], ApplicationStatus::values());
        $this->assertSame(['pending', 'approved', 'rejected'], ApprovalStatus::values());
    }

    public function test_policies_enforce_superadmin_and_owner_access(): void
    {
        $superRole = Role::firstOrCreate(['name' => RoleName::SuperAdmin->value], ['display_name' => 'Super Admin']);
        $adminRole = Role::firstOrCreate(['name' => RoleName::Admin->value], ['display_name' => 'Admin']);
        $memberRole = Role::firstOrCreate(['name' => RoleName::Member->value], ['display_name' => 'Member']);

        $super = User::create([
            'name' => 'Super',
            'username' => 'super_policy',
            'email' => 'super_policy@apex.dev',
            'password' => 'password123',
            'role_id' => $superRole->id,
            'is_active' => true,
        ]);

        $adminA = User::create([
            'name' => 'Admin A',
            'username' => 'admin_a_policy',
            'email' => 'admin_a_policy@apex.dev',
            'password' => 'password123',
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $adminB = User::create([
            'name' => 'Admin B',
            'username' => 'admin_b_policy',
            'email' => 'admin_b_policy@apex.dev',
            'password' => 'password123',
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $member = User::create([
            'name' => 'Member',
            'username' => 'member_policy',
            'email' => 'member_policy@apex.dev',
            'password' => 'password123',
            'role_id' => $memberRole->id,
            'is_active' => true,
        ]);

        $project = new Project(['created_by' => $adminA->id]);
        $post = new BlogPost(['author_id' => $adminA->id]);
        $media = new Media(['uploaded_by' => $adminA->id]);

        $this->assertTrue(Gate::forUser($super)->allows('update', $project));
        $this->assertTrue(Gate::forUser($adminA)->allows('update', $project));
        $this->assertFalse(Gate::forUser($adminB)->allows('update', $project));
        $this->assertFalse(Gate::forUser($member)->allows('update', $project));

        $this->assertTrue(Gate::forUser($super)->allows('delete', $post));
        $this->assertTrue(Gate::forUser($adminA)->allows('delete', $post));
        $this->assertFalse(Gate::forUser($adminB)->allows('delete', $post));

        $this->assertTrue(Gate::forUser($super)->allows('delete', $media));
        $this->assertTrue(Gate::forUser($adminA)->allows('delete', $media));
        $this->assertFalse(Gate::forUser($adminB)->allows('delete', $media));
    }
}
