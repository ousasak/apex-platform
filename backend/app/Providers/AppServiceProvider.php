<?php

namespace App\Providers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Doc;
use App\Models\Media;
use App\Models\Project;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use App\Observers\BlogCategoryObserver;
use App\Observers\BlogPostObserver;
use App\Observers\MediaObserver;
use App\Observers\ProjectObserver;
use App\Observers\TagObserver;
use App\Observers\TeamMemberObserver;
use App\Policies\BlogPostPolicy;
use App\Policies\DocPolicy;
use App\Policies\MediaPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\UserPolicy;
use App\Services\Storage\CloudinaryStorageService;
use App\Services\Storage\SupabaseStorageService;
use App\Services\SupabaseStorage;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SupabaseStorageService::class);
        $this->app->singleton(SupabaseStorage::class);
        $this->app->singleton(CloudinaryStorageService::class);
    }

    public function boot(UrlGenerator $url): void
    {
        if (env('APP_ENV') === 'production') {
            $url->forceScheme('https');
        }

        // Model Observers
        Project::observe(ProjectObserver::class);
        Tag::observe(TagObserver::class);
        BlogCategory::observe(BlogCategoryObserver::class);
        TeamMember::observe(TeamMemberObserver::class);
        BlogPost::observe(BlogPostObserver::class);
        Media::observe(MediaObserver::class);

        // Authorization Policies
        Gate::policy(BlogPost::class, BlogPostPolicy::class);
        Gate::policy(Doc::class, DocPolicy::class);
        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        // Override password reset URL to point to frontend
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return $frontendUrl.'/auth/reset-password/'.$token.'?email='.urlencode($notifiable->getEmailForPasswordReset());
        });

        // Rate Limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth-strict', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->ip()),
                Limit::perSecond(2)->by($request->ip()),
            ];
        });

        RateLimiter::for('public-read', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });
    }
}
