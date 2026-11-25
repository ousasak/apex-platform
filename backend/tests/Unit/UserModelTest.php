<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_username_mutator_converts_to_lowercase(): void
    {
        $user = new User;
        $user->username = 'UpPeRCaSe_UsEr';

        $this->assertEquals('uppercase_user', $user->username);
    }

    public function test_generate_unique_username(): void
    {
        $memberRole = Role::where('name', 'member')->first();

        User::create([
            'name' => 'John Doe',
            'username' => 'john_doe',
            'email' => 'john@example.com',
            'password' => 'secret',
            'role_id' => $memberRole?->id,
        ]);

        $unique = User::generateUniqueUsername('John Doe');

        $this->assertEquals('john_doe_1', $unique);
    }

    public function test_user_role_helper_methods(): void
    {
        $superRole = Role::where('name', 'superadmin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $memberRole = Role::where('name', 'member')->first();
        $guestRole = Role::where('name', 'guest')->first();

        $superUser = new User(['role_id' => $superRole->id]);
        $superUser->setRelation('role', $superRole);

        $adminUser = new User(['role_id' => $adminRole->id]);
        $adminUser->setRelation('role', $adminRole);

        $memberUser = new User(['role_id' => $memberRole->id]);
        $memberUser->setRelation('role', $memberRole);

        $guestUser = new User(['role_id' => $guestRole->id]);
        $guestUser->setRelation('role', $guestRole);

        // Super Admin
        $this->assertTrue($superUser->isSuperAdmin());
        $this->assertTrue($superUser->isAdmin());
        $this->assertTrue($superUser->isMember());

        // Admin
        $this->assertFalse($adminUser->isSuperAdmin());
        $this->assertTrue($adminUser->isAdmin());
        $this->assertTrue($adminUser->isMember());

        // Member
        $this->assertFalse($memberUser->isSuperAdmin());
        $this->assertFalse($memberUser->isAdmin());
        $this->assertTrue($memberUser->isMember());

        // Guest
        $this->assertFalse($guestUser->isSuperAdmin());
        $this->assertFalse($guestUser->isAdmin());
        $this->assertFalse($guestUser->isMember());
    }
}
