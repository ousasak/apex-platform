<?php

namespace App\Actions\Auth;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;

class RegisterAction
{
    /**
     * @param  array{name: string, username: string, email: string, password: string}  $data
     * @return array{user: User, token: string}
     */
    public function execute(array $data): array
    {
        $memberRole = Role::where('name', RoleName::Member->value)->firstOrFail();

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role_id' => $memberRole->id,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user->load('role'),
            'token' => $token,
        ];
    }
}
