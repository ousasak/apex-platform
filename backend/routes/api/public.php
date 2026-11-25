<?php

use App\Http\Controllers\Member\ApplicationController;
use App\Http\Controllers\PublicApi\BlogController;
use App\Http\Controllers\PublicApi\ContactController;
use App\Http\Controllers\PublicApi\DocController as PublicDocController;
use App\Http\Controllers\PublicApi\HomeController;
use App\Http\Controllers\PublicApi\OgMetaController;
use App\Http\Controllers\PublicApi\ProjectController;
use App\Http\Controllers\PublicApi\PublicCollectionController;
use App\Http\Controllers\PublicApi\PublicSeriesController;
use App\Http\Controllers\PublicApi\UserProfileContentController;
use Illuminate\Support\Facades\Route;

// Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);

// Blog
Route::get('/blog/posts', [BlogController::class, 'index']);
Route::get('/blog/posts/{slug}', [BlogController::class, 'show']);
Route::get('/blog/categories', [BlogController::class, 'categories']);

// Public member profiles & scoped content
Route::get('/users/{username}/blog-posts', [UserProfileContentController::class, 'blogPosts']);
Route::get('/users/{username}/projects', [UserProfileContentController::class, 'projects']);
Route::get('/users/{username}/series/{slug}', [PublicSeriesController::class, 'show']);
Route::get('/users/{username}/collections/{slug}', [PublicCollectionController::class, 'show']);
Route::get('/users/{username}', [UserProfileContentController::class, 'show']);

// Documentation
Route::get('/docs/nav', [PublicDocController::class, 'nav']);
Route::get('/docs', [PublicDocController::class, 'index']);
Route::get('/docs/{slug}', [PublicDocController::class, 'show']);

// Open Graph meta
Route::get('/og/blog/{slug}', [OgMetaController::class, 'blogPost']);

// Team, Tags, Settings & Stats
Route::get('/team', [HomeController::class, 'team']);
Route::get('/tags', [HomeController::class, 'tags']);
Route::get('/settings/public', [HomeController::class, 'settings']);
Route::get('/stats', [HomeController::class, 'stats']);
Route::get('/storage-test', [HomeController::class, 'storageTest']);

// Contact & Applications
Route::post('/contact', [ContactController::class, 'store'])->middleware('turnstile');
Route::post('/applications', [ApplicationController::class, 'store'])->middleware('turnstile');
