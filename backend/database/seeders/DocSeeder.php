<?php

namespace Database\Seeders;

use App\Models\Doc;
use App\Models\DocMenu;
use App\Models\DocSection;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first() ?? User::first();
        $editor = User::where('email', 'editor@apex.dev')->first() ?? $admin;
        if (! $admin) {
            return;
        }

        $menus = DocMenu::all()->keyBy('slug');

        $docsData = [
            [
                'slug' => 'introduction-to-apex',
                'title' => 'Introduction to APEX Platform',
                'category' => 'Getting Started',
                'categories' => ['Getting Started'],
                'category_order' => 1,
                'order_num' => 1,
                'status' => 'published',
                'author_id' => $admin->id,
                'doc_menu_id' => $menus->get('getting-started')?->id,
                'content' => '<p>Welcome to the <strong>APEX Platform</strong> documentation. APEX combines a modern React single-page application with a Laravel 11 REST API and PostgreSQL 16 database.</p><p>Use this handbook to configure your local development environment, understand our role-based access control model, and ship new modules safely.</p>',
                'sections' => [
                    [
                        'heading' => 'Architecture Overview',
                        'content' => '<p>The platform is divided into a public showcase (Home, Projects, Blog, Docs, Team, Join Us, Contact) and a role-protected Admin &amp; Member workspace powered by Laravel Sanctum.</p>',
                        'order_num' => 1,
                    ],
                    [
                        'heading' => 'Core Capabilities',
                        'content' => '<ul><li>Dynamic portfolio &amp; collection management</li><li>Blog CMS with series, categories, and rich HTML editing</li><li>Hierarchical documentation portal with multi-level menus</li><li>Granular admin permissions and approval workflow</li></ul>',
                        'order_num' => 2,
                    ],
                ],
                'days_ago' => 90,
            ],
            [
                'slug' => 'local-development-setup',
                'title' => 'Local Development & Database Seeding',
                'category' => 'Getting Started',
                'categories' => ['Getting Started', 'Deployment & Ops'],
                'category_order' => 1,
                'order_num' => 2,
                'status' => 'published',
                'author_id' => $editor->id,
                'doc_menu_id' => $menus->get('local-setup')?->id,
                'content' => '<p>Run migrations and seeders to initialize a complete, realistic dataset across all modules.</p><pre><code>cd backend
php artisan migrate
php artisan db:seed</code></pre>',
                'sections' => [
                    [
                        'heading' => 'Prerequisites',
                        'content' => '<p>Ensure PHP 8.3+, Composer, Node.js 20+, and PostgreSQL 16 (or Docker Desktop) are installed locally.</p>',
                        'order_num' => 1,
                    ],
                    [
                        'heading' => 'Default Seeded Accounts',
                        'content' => '<ul><li>Super Admin: <code>admin@apex.dev</code> / <code>password</code></li><li>Admin (Editor): <code>editor@apex.dev</code> / <code>password</code></li><li>Admin (Restricted): <code>junior.admin@apex.dev</code> / <code>password</code></li><li>Member: <code>member@apex.dev</code> / <code>password</code></li></ul>',
                        'order_num' => 2,
                    ],
                ],
                'days_ago' => 75,
            ],
            [
                'slug' => 'authentication-and-rbac',
                'title' => 'Authentication, Roles & Approval Workflow',
                'category' => 'Platform Guides',
                'categories' => ['Platform Guides'],
                'category_order' => 2,
                'order_num' => 1,
                'status' => 'published',
                'author_id' => $admin->id,
                'doc_menu_id' => $menus->get('auth-and-rbac')?->id,
                'content' => '<p>APEX enforces a four-tier role hierarchy: <strong>Super Admin</strong>, <strong>Admin</strong>, <strong>Member</strong>, and <strong>Guest</strong>.</p>',
                'sections' => [
                    [
                        'heading' => 'Per-Resource Admin Permissions',
                        'content' => '<p>Super Admins can grant or revoke <code>can_create</code>, <code>can_update</code>, and <code>can_delete</code> per resource (projects, blog posts, categories, tags, team members, media) for each Admin account.</p>',
                        'order_num' => 1,
                    ],
                    [
                        'heading' => 'Approval Interception Queue',
                        'content' => '<p>When a regular Admin submits a mutation they do not have direct permission for, the model observer intercepts it and creates a pending record in <code>approval_requests</code> with HTTP 202.</p>',
                        'order_num' => 2,
                    ],
                ],
                'days_ago' => 50,
            ],
            [
                'slug' => 'managing-projects-and-blog',
                'title' => 'Managing Projects, Collections & Blog Series',
                'category' => 'Platform Guides',
                'categories' => ['Platform Guides'],
                'category_order' => 2,
                'order_num' => 2,
                'status' => 'published',
                'author_id' => $editor->id,
                'doc_menu_id' => $menus->get('content-management')?->id,
                'content' => '<p>Organize related projects into author-owned Collections and group multi-part blog articles into Series.</p>',
                'sections' => [
                    [
                        'heading' => 'Ownership Scoping Rules',
                        'content' => '<p>Regular Admins only manage their own projects, collections, blog posts, and series. Super Admins can oversee all content across authors.</p>',
                        'order_num' => 1,
                    ],
                ],
                'days_ago' => 30,
            ],
            [
                'slug' => 'public-rest-api-overview',
                'title' => 'Public REST API Reference',
                'category' => 'API Reference',
                'categories' => ['API Reference'],
                'category_order' => 3,
                'order_num' => 1,
                'status' => 'published',
                'author_id' => $editor->id,
                'doc_menu_id' => $menus->get('public-endpoints')?->id,
                'content' => '<p>All public read endpoints return a consistent JSON envelope: <code>{ "success": true, "data": ..., "meta": ... }</code>.</p>',
                'sections' => [
                    [
                        'heading' => 'Core Public Endpoints',
                        'content' => '<ul><li><code>GET /api/stats</code> — Live database statistics</li><li><code>GET /api/settings/public</code> — Public site configuration</li><li><code>GET /api/projects</code> — Filterable paginated portfolio</li><li><code>GET /api/blog/posts</code> — Paginated published articles</li><li><code>GET /api/docs/nav</code> — Hierarchical documentation tree</li></ul>',
                        'order_num' => 1,
                    ],
                ],
                'days_ago' => 18,
            ],
            [
                'slug' => 'production-deployment-checklist',
                'title' => 'Production Deployment Checklist (Draft)',
                'category' => 'Deployment & Ops',
                'categories' => ['Deployment & Ops'],
                'category_order' => 4,
                'order_num' => 1,
                'status' => 'draft',
                'author_id' => $admin->id,
                'doc_menu_id' => $menus->get('getting-started')?->id,
                'content' => '<p>Internal draft checklist covering environment variables, SSL termination, Redis cache warming, and automated PostgreSQL backups.</p>',
                'sections' => [
                    [
                        'heading' => 'Pre-Flight Verification',
                        'content' => '<p>Verify <code>APP_DEBUG=false</code>, Turnstile keys, Sanctum stateful domains, and automated backups before release.</p>',
                        'order_num' => 1,
                    ],
                ],
                'days_ago' => 4,
            ],
        ];

        foreach ($docsData as $item) {
            $sections = $item['sections'] ?? [];
            $daysAgo = $item['days_ago'];
            unset($item['sections'], $item['days_ago']);

            $existing = Doc::withTrashed()->where('slug', $item['slug'])->first();
            if ($existing) {
                if ($existing->trashed()) {
                    $existing->restore();
                }
                $existing->update($item);
                $doc = $existing;
            } else {
                $doc = Doc::create($item);
                $timestamp = now()->subDays($daysAgo);
                $doc->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();
            }

            foreach ($sections as $section) {
                DocSection::updateOrCreate(
                    [
                        'doc_id' => $doc->id,
                        'heading' => $section['heading'],
                    ],
                    [
                        'content' => $section['content'],
                        'order_num' => $section['order_num'],
                    ]
                );
            }
        }
    }
}
