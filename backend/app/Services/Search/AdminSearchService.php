<?php

namespace App\Services\Search;

use App\Models\Application;
use App\Models\BlogPost;
use App\Models\Doc;
use App\Models\Message;
use App\Models\Project;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\Storage\SupabaseStorageService;
use Illuminate\Support\Facades\Schema;

class AdminSearchService
{
    public function __construct(
        private readonly SupabaseStorageService $storage,
    ) {}

    /**
     * @return array{results: array<string, mixed>, totals: array<string, int>}
     */
    public function search(?User $user, string $queryText, string $filter = 'all', int $limit = 5): array
    {
        $isSuperAdmin = $user && $user->isSuperAdmin();
        $like = '%'.strtolower(trim($queryText)).'%';

        $results = [];

        if ($isSuperAdmin && in_array($filter, ['all', 'users'], true)) {
            $results['users'] = User::with('role')
                ->where(function ($query) use ($like) {
                    $query->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(username) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                })
                ->limit($limit)
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'title' => $u->name,
                    'name' => $u->name,
                    'email' => $u->email,
                    'subtitle' => '@'.$u->username.' · '.$u->email,
                    'meta' => $u->role?->display_name ?? $u->role?->name ?? 'No role',
                    'avatar' => $u->publicAvatarUrl(),
                    'is_active' => $u->is_active,
                ]);
        }

        if (in_array($filter, ['all', 'projects'], true)) {
            $projectQuery = Project::query();
            if (! $isSuperAdmin && $user) {
                $projectQuery->where('created_by', $user->id);
            }

            $results['projects'] = $projectQuery
                ->where(function ($query) use ($like) {
                    $query->whereRaw('LOWER(title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$like]);
                })
                ->limit($limit)
                ->get()
                ->map(fn (Project $p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'subtitle' => $p->status,
                    'status' => $p->status,
                    'meta' => $p->created_at?->format('M d, Y'),
                    'thumbnail' => $p->cover_image ? $this->storage->url($p->cover_image) : null,
                ]);
        }

        if (in_array($filter, ['all', 'posts'], true)) {
            $postQuery = BlogPost::with('category');
            if (! $isSuperAdmin && $user) {
                $postQuery->where('author_id', $user->id);
            }

            $results['posts'] = $postQuery
                ->where(function ($query) use ($like) {
                    $query->whereRaw('LOWER(title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(excerpt) LIKE ?', [$like]);
                })
                ->limit($limit)
                ->get()
                ->map(fn (BlogPost $p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'subtitle' => $p->category?->name ?? 'Uncategorized',
                    'meta' => $p->status,
                    'status' => $p->status,
                    'thumbnail' => $p->cover_image ? $this->storage->url($p->cover_image) : null,
                ]);
        }

        if (Schema::hasTable('docs') && in_array($filter, ['all', 'docs'], true)) {
            $docQuery = Doc::query();
            if (! $isSuperAdmin && $user) {
                $docQuery->where('author_id', $user->id);
            }

            $results['docs'] = $docQuery
                ->where(function ($query) use ($like) {
                    $query->whereRaw('LOWER(title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(slug) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(category) LIKE ?', [$like]);
                })
                ->limit($limit)
                ->get()
                ->map(fn (Doc $d) => [
                    'id' => $d->id,
                    'title' => $d->title,
                    'subtitle' => $d->category ?: 'General',
                    'meta' => $d->status,
                    'status' => $d->status,
                ]);
        }

        if (in_array($filter, ['all', 'messages'], true)) {
            $results['messages'] = Message::where(function ($query) use ($like) {
                $query->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(subject) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
            })
                ->limit($limit)
                ->get()
                ->map(fn (Message $m) => [
                    'id' => $m->id,
                    'title' => $m->subject ?: $m->name,
                    'subtitle' => $m->name.' · '.$m->email,
                    'meta' => $m->is_read ? 'Read' : 'Unread',
                    'is_read' => $m->is_read,
                ]);
        }

        if (in_array($filter, ['all', 'applications'], true)) {
            $results['applications'] = Application::where(function ($query) use ($like) {
                $query->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(role_applied) LIKE ?', [$like]);
            })
                ->limit($limit)
                ->get()
                ->map(fn (Application $a) => [
                    'id' => $a->id,
                    'title' => $a->name,
                    'subtitle' => $a->role_applied.' · '.$a->email,
                    'meta' => $a->status,
                ]);
        }

        if (in_array($filter, ['all', 'team'], true)) {
            $results['team'] = TeamMember::where(function ($query) use ($like) {
                $query->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(title) LIKE ?', [$like]);
            })
                ->limit($limit)
                ->get()
                ->map(fn (TeamMember $t) => [
                    'id' => $t->id,
                    'title' => $t->name,
                    'subtitle' => $t->title,
                    'avatar' => $t->avatar ? $this->storage->url($t->avatar) : null,
                ]);
        }

        if (in_array($filter, ['all', 'tags'], true)) {
            $results['tags'] = Tag::whereRaw('LOWER(name) LIKE ?', [$like])
                ->limit($limit)
                ->get()
                ->map(fn (Tag $t) => [
                    'id' => $t->id,
                    'title' => $t->name,
                    'subtitle' => $t->slug,
                    'color' => $t->color,
                ]);
        }

        $totals = [];
        foreach ($results as $key => $items) {
            $totals[$key] = count($items);
        }

        return [
            'results' => $results,
            'totals' => $totals,
        ];
    }
}
