<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Series;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $categoriesBySlug = BlogCategory::all()->keyBy('slug');
        $usersByEmail = User::where('is_active', true)->get()->keyBy('email');
        $fallbackAuthor = $usersByEmail->get('admin@apex.dev') ?? $usersByEmail->first();
        if (! $fallbackAuthor) {
            return;
        }

        $seriesByKey = Series::all()
            ->keyBy(fn (Series $s) => $s->author_id.':'.$s->slug);

        $posts = [
            [
                'author_email' => 'admin@apex.dev',
                'category_slug' => 'announcement',
                'series_slug' => null,
                'title' => 'APEX Platform Launch & Community Roadmap',
                'slug' => 'apex-launch',
                'excerpt' => 'Introducing APEX — a student-driven Cambodian engineering collective building open-source tools, guides, and production web apps.',
                'content' => '<h1>APEX Platform Launch</h1><p>We are thrilled to announce the official launch of <strong>APEX</strong>, a collective of passionate Cambodian developers committed to building impactful open-source projects and sharing engineering knowledge.</p><h2>Our Mission</h2><p>Research. Document. Develop. Showcase. Help Others.</p><h2>What Comes Next</h2><ul><li>Open-source Khmer developer tooling and UI kits</li><li>Structured engineering series and documentation guides</li><li>Monthly open-source contributor sprints in Phnom Penh</li></ul>',
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 628,
                'reading_time' => 4,
                'days_ago' => 140,
            ],
            [
                'author_email' => 'editor@apex.dev',
                'category_slug' => 'tutorial',
                'series_slug' => 'postgresql-backend-mastery',
                'title' => 'Building Production REST APIs with Laravel 11 & Sanctum',
                'slug' => 'building-rest-apis-laravel-11',
                'excerpt' => 'A practical guide to designing clean REST APIs with Laravel 11, Sanctum token auth, RBAC middleware, and API Resources.',
                'content' => '<h1>Building REST APIs with Laravel 11</h1><p>Laravel 11 streamlines API development with lightweight middleware configuration, strict form request validation, and expressive Eloquent Resources.</p><h2>Authentication with Sanctum</h2><pre><code>Route::middleware([\'auth:sanctum\'])->group(function () {
    Route::get(\'/auth/me\', [AuthController::class, \'me\']);
});</code></pre><h2>Key Takeaways</h2><ul><li>Always authorize ownership server-side</li><li>Use API Resources to guarantee consistent JSON contracts</li><li>Paginate every list endpoint cleanly</li></ul>',
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 412,
                'reading_time' => 11,
                'days_ago' => 112,
            ],
            [
                'author_email' => 'editor@apex.dev',
                'category_slug' => 'architecture',
                'series_slug' => 'postgresql-backend-mastery',
                'title' => 'PostgreSQL 16 Indexing & Query Optimization Guide',
                'slug' => 'introduction-postgresql-16',
                'excerpt' => 'Explore B-tree, composite indexes, JSONB queries, and EXPLAIN ANALYZE techniques in PostgreSQL 16.',
                'content' => '<h1>PostgreSQL 16 Query Optimization</h1><p>PostgreSQL 16 brings stronger query parallelism and smarter planner optimizations. Good indexing still makes the biggest real-world difference.</p><pre><code>EXPLAIN ANALYZE
SELECT * FROM blog_posts
WHERE status = \'published\'
ORDER BY published_at DESC
LIMIT 12;</code></pre><p>Combine composite indexes on status and publish dates to eliminate costly sorts on growing datasets.</p>',
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 289,
                'reading_time' => 8,
                'days_ago' => 88,
            ],
            [
                'author_email' => 'editor@apex.dev',
                'category_slug' => 'devops',
                'series_slug' => 'devops-containerization-playbook',
                'title' => 'Docker Compose for Full-Stack Laravel & React Teams',
                'slug' => 'docker-fullstack-development',
                'excerpt' => 'Containerize PHP-FPM, Nginx, PostgreSQL 16, and Vite seamlessly for reproducible local and production deployments.',
                'content' => '<h1>Docker for Full-Stack Development</h1><p>Containerizing your local stack ensures every contributor runs identical PHP, Node, and PostgreSQL versions without host conflicts.</p><pre><code>services:
  backend:
    build: ./backend
  postgres:
    image: postgres:16-alpine
  webclient:
    build: ./webclient</code></pre><p>Pair healthchecks with named volumes so database migrations run reliably on cold starts.</p>',
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 315,
                'reading_time' => 7,
                'days_ago' => 64,
            ],
            [
                'author_email' => 'member@apex.dev',
                'category_slug' => 'tutorial',
                'series_slug' => 'modern-frontend-craft',
                'title' => 'Tailwind CSS Architecture & Dark Mode Design Tokens',
                'slug' => 'tailwind-css-tips-tricks',
                'excerpt' => 'Build maintainable dark and light UI surfaces with semantic CSS variables, glassmorphism, and Tailwind utility patterns.',
                'content' => '<h1>Tailwind CSS Design Tokens</h1><p>Pairing semantic CSS variables with Tailwind utility classes keeps large React applications consistent across dark and light modes.</p><pre><code>.surface-panel {
  background: var(--surface-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
}</code></pre><p>Define shared elevation and border tokens early so every admin page inherits uniform polish.</p>',
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 248,
                'reading_time' => 6,
                'days_ago' => 45,
            ],
            [
                'author_email' => 'admin@apex.dev',
                'category_slug' => 'architecture',
                'series_slug' => 'fullstack-laravel-react',
                'title' => 'Designing Role-Based Access Control & Approval Workflows',
                'slug' => 'designing-rbac-approval-workflows',
                'excerpt' => 'How APEX implements granular admin permissions with an observer-backed approval queue for safe content operations.',
                'content' => '<h1>RBAC &amp; Approval Workflows</h1><p>In team-operated platforms, not every admin should immediately delete production records. Intercepting unauthorized mutations into a reviewable approval queue combines velocity with governance.</p><h2>Workflow Stages</h2><ol><li>Check user role and per-resource permissions in model observers</li><li>Queue pending payload in <code>approval_requests</code></li><li>Allow Super Admins to inspect, approve, or reject with audit logs</li></ol>',
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 487,
                'reading_time' => 9,
                'days_ago' => 22,
            ],
            [
                'author_email' => 'member@apex.dev',
                'category_slug' => 'development',
                'series_slug' => 'modern-frontend-craft',
                'title' => 'Getting Started with Reactive State Management in React',
                'slug' => 'getting-started-vue3-composition-api',
                'excerpt' => 'Structuring clean client state with Zustand stores, modular API services, and responsive loading/error states.',
                'content' => '<h1>Clean State Management in React</h1><p>Separating global session state (Zustand) from server data fetching keeps components predictable and eliminates stale state bugs.</p><h2>Best Practices</h2><ul><li>Keep API services strictly typed and centralized</li><li>Always handle loading, empty, and error states explicitly</li><li>Invalidate or refetch lists immediately after mutations</li></ul>',
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 364,
                'reading_time' => 8,
                'days_ago' => 9,
            ],
            [
                'author_email' => 'junior.admin@apex.dev',
                'category_slug' => 'tutorial',
                'series_slug' => null,
                'title' => 'Flutter Cross-Platform Mobile Architecture Guide',
                'slug' => 'flutter-mobile-development-guide',
                'excerpt' => 'Draft guide to organizing Flutter apps with layered UI, state, and repository modules.',
                'content' => '<h1>Flutter Mobile Architecture</h1><p>Draft walkthrough covering clean folder conventions, HTTP client wrappers, and bilingual Khmer/English localization in Flutter.</p>',
                'status' => 'draft',
                'is_featured' => false,
                'views_count' => 0,
                'reading_time' => 10,
                'days_ago' => 5,
            ],
            [
                'author_email' => 'junior.admin@apex.dev',
                'category_slug' => 'development',
                'series_slug' => null,
                'title' => 'Open Source Contribution Playbook for Students',
                'slug' => 'open-source-contribution-guide',
                'excerpt' => 'How university developers can pick good first issues, write clean pull requests, and collaborate on GitHub.',
                'content' => '<h1>Open Source Contribution Playbook</h1><p>Contributing to open source accelerates real-world engineering skills. Start small, read contribution guidelines carefully, and write crisp commit messages.</p>',
                'status' => 'draft',
                'is_featured' => false,
                'views_count' => 0,
                'reading_time' => 5,
                'days_ago' => 2,
            ],
            [
                'author_email' => 'admin@apex.dev',
                'category_slug' => 'announcement',
                'series_slug' => 'fullstack-laravel-react',
                'title' => 'Legacy v1 Migration Notes (Archived)',
                'slug' => 'legacy-v1-migration-notes',
                'excerpt' => 'Historical release notes from our early v1 prototype before migrating to our unified PostgreSQL schema.',
                'content' => '<h1>Legacy v1 Migration Notes</h1><p>Archived reference notes documenting early architecture decisions and schema migrations.</p>',
                'status' => 'archived',
                'is_featured' => false,
                'views_count' => 118,
                'reading_time' => 4,
                'days_ago' => 155,
            ],
        ];

        foreach ($posts as $postData) {
            $authorEmail = $postData['author_email'];
            $categorySlug = $postData['category_slug'];
            $seriesSlug = $postData['series_slug'];
            $daysAgo = $postData['days_ago'];
            unset($postData['author_email'], $postData['category_slug'], $postData['series_slug'], $postData['days_ago']);

            $author = $usersByEmail->get($authorEmail) ?? $fallbackAuthor;
            $category = $categoriesBySlug->get($categorySlug) ?? $categoriesBySlug->first();
            if (! $category) {
                continue;
            }

            $postData['author_id'] = $author->id;
            $postData['category_id'] = $category->id;
            $postData['series_id'] = $seriesSlug
                ? $seriesByKey->get($author->id.':'.$seriesSlug)?->id
                : null;
            $postData['published_at'] = $postData['status'] === 'published'
                ? now()->subDays($daysAgo)
                : null;

            BlogPost::withoutEvents(function () use ($postData, $daysAgo) {
                $existing = BlogPost::withTrashed()->where('slug', $postData['slug'])->first();
                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    // Preserve live views_count if already higher than seeded baseline
                    $updateData = $postData;
                    $updateData['views_count'] = max((int) $existing->views_count, (int) $postData['views_count']);
                    $existing->update($updateData);

                    return;
                }

                $created = BlogPost::create($postData);
                $timestamp = now()->subDays($daysAgo);
                $created->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();
            });
        }
    }
}
