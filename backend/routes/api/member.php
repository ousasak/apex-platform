<?php

use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Member\NotificationController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\PublicApi\HomeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    // Rich-text editor uploads
    Route::post('/upload', [MediaController::class, 'upload']);

    // Member self-service
    Route::prefix('member')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);

        Route::get('/storage-settings', [HomeController::class, 'storageSettings']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    });
});
