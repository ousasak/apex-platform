<?php

namespace App\Services\Analytics;

use App\Enums\ApplicationStatus;
use App\Enums\ApprovalStatus;
use App\Enums\ProjectStatus;
use App\Enums\PublishStatus;
use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\ApprovalRequest;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\ContentCollection;
use App\Models\Doc;
use App\Models\Media;
use App\Models\Message;
use App\Models\Project;
use App\Models\Series;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class DashboardStatsService
{
    public function getStats(?User $user): array
    {
        $isSuperAdmin = $user && $user->isSuperAdmin();

        $projectBase = Project::query();
        $blogBase = BlogPost::query();
        $mediaBase = Media::query();
        $seriesBase = Series::query();
        $collectionBase = ContentCollection::query();

        if (! $isSuperAdmin && $user) {
            $projectBase->where('created_by', $user->id);
            $blogBase->where('author_id', $user->id);
            $mediaBase->where('uploaded_by', $user->id);
            $seriesBase->where('author_id', $user->id);
            $collectionBase->where('author_id', $user->id);
        }

        $totalUsers = $isSuperAdmin ? User::count() : 0;
        $activeUsers = $isSuperAdmin ? User::where('is_active', true)->count() : 0;
        $inactiveUsers = $isSuperAdmin ? User::where('is_active', false)->count() : 0;

        $totalProjects = (clone $projectBase)->count();
        $projectsByStatus = [
            ProjectStatus::Active->value => (clone $projectBase)->where('status', ProjectStatus::Active->value)->count(),
            ProjectStatus::Wip->value => (clone $projectBase)->where('status', ProjectStatus::Wip->value)->count(),
            ProjectStatus::Archived->value => (clone $projectBase)->where('status', ProjectStatus::Archived->value)->count(),
        ];

        $publishedBlogPosts = (clone $blogBase)->where('status', PublishStatus::Published->value)->count();
        $blogPostsByStatus = [
            PublishStatus::Published->value => $publishedBlogPosts,
            PublishStatus::Draft->value => (clone $blogBase)->where('status', PublishStatus::Draft->value)->count(),
            PublishStatus::Archived->value => (clone $blogBase)->where('status', PublishStatus::Archived->value)->count(),
        ];
        $totalBlogPostsAll = array_sum($blogPostsByStatus);
        $totalBlogViews = (int) (clone $blogBase)->sum('views_count');

        $totalDocs = 0;
        $publishedDocs = 0;
        $draftDocs = 0;
        if (Schema::hasTable('docs')) {
            $docBase = Doc::query();
            if (! $isSuperAdmin && $user) {
                $docBase->where('author_id', $user->id);
            }
            $totalDocs = (clone $docBase)->count();
            $publishedDocs = (clone $docBase)->where('status', PublishStatus::Published->value)->count();
            $draftDocs = (clone $docBase)->where('status', PublishStatus::Draft->value)->count();
        }

        $totalMessages = Message::count();
        $unreadMessages = Message::where('is_read', false)->count();
        $readMessages = $totalMessages - $unreadMessages;

        $applicationsByStatus = [
            ApplicationStatus::Pending->value => Application::where('status', ApplicationStatus::Pending->value)->count(),
            ApplicationStatus::Reviewing->value => Application::where('status', ApplicationStatus::Reviewing->value)->count(),
            ApplicationStatus::Accepted->value => Application::where('status', ApplicationStatus::Accepted->value)->count(),
            ApplicationStatus::Rejected->value => Application::where('status', ApplicationStatus::Rejected->value)->count(),
        ];
        $totalApplications = array_sum($applicationsByStatus);
        $pendingApplications = $applicationsByStatus[ApplicationStatus::Pending->value];

        $approvalBase = ApprovalRequest::query();
        if (! $isSuperAdmin && $user) {
            $approvalBase->where('requested_by', $user->id);
        }
        $pendingApprovals = (clone $approvalBase)->where('status', ApprovalStatus::Pending->value)->count();
        $totalApprovals = (clone $approvalBase)->count();

        $totalMedia = (clone $mediaBase)->count();
        $totalMediaSize = (int) (clone $mediaBase)->sum('size');
        $totalTeamMembers = TeamMember::count();
        $visibleTeamMembers = TeamMember::where('is_visible', true)->count();

        $monthlyTrends = $this->buildMonthlyTrends($isSuperAdmin, $user?->id);

        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        $periodComparison = [
            'projects_current' => (clone $projectBase)->where('created_at', '>=', $thirtyDaysAgo)->count(),
            'projects_previous' => (clone $projectBase)->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count(),
            'blog_posts_current' => (clone $blogBase)->where('created_at', '>=', $thirtyDaysAgo)->count(),
            'blog_posts_previous' => (clone $blogBase)->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count(),
            'users_current' => $isSuperAdmin ? User::where('created_at', '>=', $thirtyDaysAgo)->count() : 0,
            'users_previous' => $isSuperAdmin ? User::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count() : 0,
            'messages_current' => Message::where('created_at', '>=', $thirtyDaysAgo)->count(),
            'messages_previous' => Message::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count(),
            'applications_current' => Application::where('created_at', '>=', $thirtyDaysAgo)->count(),
            'applications_previous' => Application::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count(),
        ];

        return [
            'scope' => $isSuperAdmin ? 'global' : 'personal',
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'total_projects' => $totalProjects,
            'projects_by_status' => $projectsByStatus,
            'total_blog_posts' => $publishedBlogPosts,
            'total_blog_posts_all' => $totalBlogPostsAll,
            'blog_posts_by_status' => $blogPostsByStatus,
            'total_blog_views' => $totalBlogViews,
            'total_docs' => $totalDocs,
            'published_docs' => $publishedDocs,
            'draft_docs' => $draftDocs,
            'total_team_members' => $totalTeamMembers,
            'visible_team_members' => $visibleTeamMembers,
            'total_messages' => $totalMessages,
            'read_messages' => $readMessages,
            'unread_messages' => $unreadMessages,
            'total_applications' => $totalApplications,
            'pending_applications' => $pendingApplications,
            'applications_by_status' => $applicationsByStatus,
            'pending_approvals' => $pendingApprovals,
            'total_approvals' => $totalApprovals,
            'total_media' => $totalMedia,
            'total_media_size' => $totalMediaSize,
            'total_series' => Schema::hasTable('series') ? (clone $seriesBase)->count() : 0,
            'total_collections' => Schema::hasTable('collections') ? (clone $collectionBase)->count() : 0,
            'total_tags' => Tag::count(),
            'total_categories' => BlogCategory::count(),
            'monthly_trends' => $monthlyTrends,
            'period_comparison' => $periodComparison,
        ];
    }

    public function getRecentActivity(?User $user, int $limit = 15): Collection
    {
        $isSuperAdmin = $user && $user->isSuperAdmin();

        $query = ActivityLog::with('user')->orderByDesc('created_at')->limit($limit);

        if (! $isSuperAdmin && $user) {
            $query->where('user_id', $user->id);
        }

        return $query->get()->map(function (ActivityLog $log) {
            $shortType = $log->subject_type ? class_basename($log->subject_type) : null;

            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'subject_type' => $shortType,
                'target_type' => $shortType,
                'subject_id' => $log->subject_id,
                'created_at' => $log->created_at?->toISOString(),
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'username' => $log->user->username,
                    'avatar' => $log->user->publicAvatarUrl(),
                ] : null,
            ];
        });
    }

    /**
     * Build 6-month chronological counts using portable timestamp bucketing.
     *
     * @return array<int, array<string, int|string>>
     */
    private function buildMonthlyTrends(bool $isSuperAdmin, ?int $userId): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(5);
        $months = [];

        for ($i = 0; $i < 6; $i++) {
            $month = $start->copy()->addMonths($i);
            $key = $month->format('Y-m');
            $months[$key] = [
                'month' => $key,
                'label' => $month->format('M Y'),
                'users' => 0,
                'projects' => 0,
                'blog_posts' => 0,
                'applications' => 0,
                'messages' => 0,
            ];
        }

        $bucket = static function ($timestamps, string $field) use (&$months): void {
            foreach ($timestamps as $ts) {
                if (! $ts) {
                    continue;
                }
                $key = Carbon::parse($ts)->format('Y-m');
                if (isset($months[$key])) {
                    $months[$key][$field]++;
                }
            }
        };

        if ($isSuperAdmin) {
            $bucket(User::where('created_at', '>=', $start)->pluck('created_at'), 'users');
        }

        $projQuery = Project::where('created_at', '>=', $start);
        $postQuery = BlogPost::where('created_at', '>=', $start);
        if (! $isSuperAdmin && $userId) {
            $projQuery->where('created_by', $userId);
            $postQuery->where('author_id', $userId);
        }

        $bucket($projQuery->pluck('created_at'), 'projects');
        $bucket($postQuery->pluck('created_at'), 'blog_posts');
        $bucket(Application::where('created_at', '>=', $start)->pluck('created_at'), 'applications');
        $bucket(Message::where('created_at', '>=', $start)->pluck('created_at'), 'messages');

        return array_values($months);
    }
}
