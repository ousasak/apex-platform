<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

// Public authentication endpoints
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('turnstile');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// Authenticated session endpoints
Route::middleware(['auth:sanctum'])->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
