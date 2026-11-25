<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginAction
{
    /**
     * Attempt to authenticate a user by email and password.
     *
     * @return array{ok: true, user: User, token: string}|array{ok: false, status: int, message: string, hit_limiter: bool}
     */
    public function execute(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return [
                'ok' => false,
                'status' => 401,
                'message' => 'Invalid credentials.',
                'hit_limiter' => true,
            ];
        }

        if (! $user->is_active) {
            return [
                'ok' => false,
                'status' => 403,
                'message' => 'Your account has been deactivated.',
                'hit_limiter' => false,
            ];
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'ok' => true,
            'user' => $user->load('role'),
            'token' => $token,
        ];
    }
}
