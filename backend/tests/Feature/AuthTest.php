<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $payload = [
            'name' => 'Sophea Sok',
            'username' => 'sophea_sok',
            'email' => 'sophea@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'username', 'email'],
                    'token',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'sophea@example.com',
            'username' => 'sophea_sok',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $memberRole = Role::where('name', 'member')->first();
        User::create([
            'name' => 'Dara Chan',
            'username' => 'darachan',
            'email' => 'dara@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $memberRole->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'dara@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'dara@example.com')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user',
                    'token',
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $memberRole = Role::where('name', 'member')->first();
        User::create([
            'name' => 'Dara Chan',
            'username' => 'darachan2',
            'email' => 'dara2@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $memberRole->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'dara2@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $memberRole = Role::where('name', 'member')->first();
        User::create([
            'name' => 'Inactive User',
            'username' => 'inactive_user',
            'email' => 'inactive@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $memberRole->id,
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Your account has been deactivated.');
    }

    public function test_unauthenticated_request_to_me_returns_401(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_authenticated_user_can_access_me_and_logout(): void
    {
        $memberRole = Role::where('name', 'member')->first();
        $user = User::create([
            'name' => 'Active User',
            'username' => 'active_user',
            'email' => 'active@example.com',
            'password' => Hash::make('Password123!'),
            'role_id' => $memberRole->id,
            'is_active' => true,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // /api/auth/me
        $meResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'active@example.com');

        // /api/auth/logout
        $logoutResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
