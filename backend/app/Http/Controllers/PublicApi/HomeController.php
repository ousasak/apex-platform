<?php

namespace App\Http\Controllers\PublicApi;

use App\Enums\ProjectStatus;
use App\Enums\PublishStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Models\BlogPost;
use App\Models\Doc;
use App\Models\Project;
use App\Models\Setting;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Services\Storage\SupabaseStorageService;
use App\Support\PublicApiCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'name' => 'APEX API',
            'version' => '1.0.0',
        ]);
    }

    public function settings(): JsonResponse
    {
        $settings = Cache::remember(PublicApiCache::KEY_SETTINGS, PublicApiCache::ttl(), function () {
            return Setting::whereIn('group', ['general', 'social', 'seo'])->get()
                ->mapWithKeys(function (Setting $s) {
                    $value = match ($s->type) {
                        'boolean' => filter_var($s->value, FILTER_VALIDATE_BOOLEAN),
                        'integer' => (int) $s->value,
                        'json' => json_decode((string) $s->value, true),
                        default => $s->value,
                    };

                    return [$s->key => $value];
                });
        });

        return $this->successResponse($settings);
    }

    public function stats(): JsonResponse
    {
        $stats = Cache::remember(PublicApiCache::KEY_STATS, PublicApiCache::ttl(), function () {
            return [
                'team_members' => TeamMember::where('is_visible', true)->count(),
                'projects' => Project::count(),
                'active_projects' => Project::where('status', ProjectStatus::Active->value)->count(),
                'open_source_projects' => Project::where('is_open_source', true)->count(),
                'total_stars' => (int) Project::sum('stars_count'),
                'blog_posts' => BlogPost::where('status', PublishStatus::Published->value)->count(),
                'total_blog_views' => (int) BlogPost::where('status', PublishStatus::Published->value)->sum('views_count'),
                'docs' => Schema::hasTable('docs')
                    ? Doc::where('status', PublishStatus::Published->value)->count()
                    : 0,
                'tags' => Tag::count(),
                'founded_year' => (int) Setting::getValue('founded_year', 2024),
            ];
        });

        return $this->successResponse($stats);
    }

    public function team(): JsonResponse
    {
        $members = Cache::remember(PublicApiCache::KEY_TEAM, PublicApiCache::ttl(), function () {
            return TeamMember::where('is_visible', true)->orderBy('display_order')->get();
        });

        return $this->successResponse(TeamMemberResource::collection($members));
    }

    public function tags(): JsonResponse
    {
        $tags = Cache::remember(PublicApiCache::KEY_TAGS, PublicApiCache::ttl(), fn () => Tag::orderBy('name')->get());

        return $this->successResponse($tags);
    }

    public function storageSettings(): JsonResponse
    {
        $providers = Setting::getValue('allowed_storage_providers', 'both');

        return $this->successResponse(['allowed_storage_providers' => $providers]);
    }

    public function storageTest(SupabaseStorageService $storage): JsonResponse
    {
        return response()->json($storage->test());
    }
}
