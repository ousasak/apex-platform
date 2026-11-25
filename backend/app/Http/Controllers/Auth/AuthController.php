<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\LoginAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function login(LoginRequest $request, LoginAction $action): JsonResponse
    {
        $key = 'login-attempt:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return $this->errorResponse(
                "អ្នកបានព្យាយាមច្រើនដងពេកហើយ សូមរង់ចាំ $seconds វិនាទីទៀត!",
                429
            );
        }

        $result = $action->execute((string) $request->email, (string) $request->password);

        if (! $result['ok']) {
            if ($result['hit_limiter']) {
                RateLimiter::hit($key, 60);
            }

            return $this->errorResponse($result['message'], $result['status']);
        }

        RateLimiter::clear($key);

        return $this->successResponse(
            data: [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
            message: 'Login successful.',
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(new UserResource($request->user()->load('role')));
    }
}
