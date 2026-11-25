<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Admin\ApprovalRequestController;
use App\Http\Controllers\Admin\BlogPostController;
use App\Http\Controllers\Admin\CollectionsController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DocController;
use App\Http\Controllers\Admin\DocMenuController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\Admin\SeriesController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StorageStatsController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPermissionController;
use App\Http\Controllers\PublicApi\HomeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard & Permissions
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/activity', [DashboardController::class, 'activity']);
    Route::get('/my-permissions', [UserPermissionController::class, 'mine']);

    // Projects
    Route::get('/projects', [AdminProjectController::class, 'index']);
    Route::post('/projects', [AdminProjectController::class, 'store']);
    Route::get('/projects/{id}', [AdminProjectController::class, 'show']);
    Route::put('/projects/{id}', [AdminProjectController::class, 'update']);
    Route::post('/projects/{id}', [AdminProjectController::class, 'update']);
    Route::delete('/projects/{id}', [AdminProjectController::class, 'destroy']);

    // Blog Posts & Categories
    Route::get('/blog/posts', [BlogPostController::class, 'index']);
    Route::post('/blog/posts', [BlogPostController::class, 'store']);
    Route::get('/blog/posts/{id}', [BlogPostController::class, 'show']);
    Route::put('/blog/posts/{id}', [BlogPostController::class, 'update']);
    Route::delete('/blog/posts/{id}', [BlogPostController::class, 'destroy']);
    Route::get('/blog/categories', [BlogPostController::class, 'categories']);
    Route::post('/blog/categories', [BlogPostController::class, 'storeCategory']);
    Route::put('/blog/categories/{id}', [BlogPostController::class, 'updateCategory']);
    Route::delete('/blog/categories/{id}', [BlogPostController::class, 'destroyCategory']);

    // Series
    Route::get('/series/assignable', [SeriesController::class, 'assignable']);
    Route::get('/series', [SeriesController::class, 'index']);
    Route::post('/series', [SeriesController::class, 'store']);
    Route::put('/series/{id}', [SeriesController::class, 'update']);
    Route::delete('/series/{id}', [SeriesController::class, 'destroy']);

    // Collections
    Route::get('/collections/assignable', [CollectionsController::class, 'assignable']);
    Route::get('/collections', [CollectionsController::class, 'index']);
    Route::post('/collections', [CollectionsController::class, 'store']);
    Route::put('/collections/{id}', [CollectionsController::class, 'update']);
    Route::delete('/collections/{id}', [CollectionsController::class, 'destroy']);

    // Applications & Messages
    Route::get('/applications', [AdminApplicationController::class, 'index']);
    Route::get('/applications/{id}', [AdminApplicationController::class, 'show']);
    Route::put('/applications/{id}/status', [AdminApplicationController::class, 'updateStatus']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markRead']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

    // Team Members
    Route::get('/team', [TeamMemberController::class, 'index']);
    Route::post('/team', [TeamMemberController::class, 'store']);
    Route::put('/team/{id}', [TeamMemberController::class, 'update']);
    Route::delete('/team/{id}', [TeamMemberController::class, 'destroy']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{id}', [TagController::class, 'update']);
    Route::post('/tags/{id}', [TagController::class, 'update']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);

    // Media
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);

    // Docs & Doc Menus
    Route::get('/docs', [DocController::class, 'index']);
    Route::post('/docs', [DocController::class, 'store']);
    Route::post('/docs/reorder', [DocController::class, 'reorder']);
    Route::get('/docs/categories', [DocController::class, 'categories']);
    Route::post('/docs/categories', [DocController::class, 'storeCategory']);
    Route::post('/docs/categories/rename', [DocController::class, 'renameCategory']);
    Route::post('/docs/categories/delete', [DocController::class, 'deleteCategory']);
    Route::get('/docs/all', [DocController::class, 'all']);
    Route::get('/docs/{id}', [DocController::class, 'show']);
    Route::put('/docs/{id}', [DocController::class, 'update']);
    Route::delete('/docs/{id}', [DocController::class, 'destroy']);

    Route::get('/doc-menus', [DocMenuController::class, 'index']);
    Route::get('/doc-menus/flat', [DocMenuController::class, 'flat']);
    Route::post('/doc-menus', [DocMenuController::class, 'store']);
    Route::post('/doc-menus/reorder', [DocMenuController::class, 'reorder']);
    Route::put('/doc-menus/{id}', [DocMenuController::class, 'update']);
    Route::delete('/doc-menus/{id}', [DocMenuController::class, 'destroy']);

    // Search & Storage Settings
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/settings/storage', [HomeController::class, 'storageSettings']);

    // Super Admin only
    Route::middleware('superadmin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::put('/users/{id}/toggle-active', [UserController::class, 'toggleActive']);

        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

        Route::get('/settings', [SettingsController::class, 'index']);
        Route::put('/settings', [SettingsController::class, 'update']);

        Route::get('/activity-logs', [ActivityLogController::class, 'index']);

        Route::get('/storage-stats', [StorageStatsController::class, 'index']);
        Route::post('/storage-stats/refresh', [StorageStatsController::class, 'refresh']);

        Route::get('/approval-requests', [ApprovalRequestController::class, 'index']);
        Route::post('/approval-requests/{id}/approve', [ApprovalRequestController::class, 'approve']);
        Route::post('/approval-requests/{id}/reject', [ApprovalRequestController::class, 'reject']);

        Route::get('/users/{id}/permissions', [UserPermissionController::class, 'show']);
        Route::put('/users/{id}/permissions', [UserPermissionController::class, 'update']);
    });
});
