<?php

namespace Database\Seeders;

use App\Models\ContentCollection;
use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $usersByEmail = User::where('is_active', true)->get()->keyBy('email');
        $fallbackUser = $usersByEmail->get('admin@apex.dev') ?? $usersByEmail->first();
        if (! $fallbackUser) {
            return;
        }

        $collectionsByKey = ContentCollection::all()
            ->keyBy(fn (ContentCollection $c) => $c->author_id.':'.$c->slug);

        $projects = [
            [
                'owner_email' => 'admin@apex.dev',
                'collection_slug' => 'apex-core-platform',
                'title' => 'APEX Website',
                'slug' => 'apex-website',
                'description' => 'Official APEX team portfolio, documentation portal, and CMS platform built with React and Laravel 11.',
                'long_description' => '<h2>APEX Platform</h2><p>A full-stack portfolio, developer blog, documentation portal, and RBAC admin CMS showcasing APEX open-source work from Cambodia.</p><h3>Architecture Highlights</h3><ul><li>React + Vite + Tailwind CSS SPA</li><li>Laravel 11 REST API with Sanctum RBAC &amp; approval workflow</li><li>PostgreSQL 16 relational schema with Redis caching</li><li>Docker Compose multi-service orchestration</li></ul>',
                'tech_stack' => ['React', 'Laravel', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
                'status' => 'active',
                'is_featured' => true,
                'is_open_source' => true,
                'stars_count' => 145,
                'forks_count' => 32,
                'repo_url' => 'https://github.com/APEX-Team/apex-website',
                'demo_url' => 'https://www.apex-team.space',
                'tags' => ['react', 'laravel', 'postgresql', 'docker', 'tailwindcss'],
                'created_days_ago' => 145,
            ],
            [
                'owner_email' => 'seanghai@apex.dev',
                'collection_slug' => 'mobile-ai-lab',
                'title' => 'Khmer NLP Toolkit',
                'slug' => 'khmer-nlp-toolkit',
                'description' => 'Open-source Natural Language Processing toolkit for Khmer word segmentation, tokenization, and text classification.',
                'long_description' => '<h2>Khmer NLP Toolkit</h2><p>Provides fast word segmentation, part-of-speech tagging, and pretrained embeddings tailored for modern Khmer text processing.</p>',
                'tech_stack' => ['Python', 'PyTorch', 'FastAPI'],
                'status' => 'active',
                'is_featured' => true,
                'is_open_source' => true,
                'stars_count' => 218,
                'forks_count' => 54,
                'repo_url' => 'https://github.com/APEX-Team/khmer-nlp',
                'demo_url' => 'https://nlp.apex-team.space',
                'tags' => ['python'],
                'created_days_ago' => 122,
            ],
            [
                'owner_email' => 'seanghai@apex.dev',
                'collection_slug' => 'mobile-ai-lab',
                'title' => 'CamPay Mobile',
                'slug' => 'campay-mobile',
                'description' => 'Cross-platform KHQR and digital wallet reference application built with Flutter.',
                'long_description' => '<h2>CamPay Mobile</h2><p>Clean architecture Flutter showcase featuring KHQR scanning, instant balance history, biometric auth, and bilingual English/Khmer localization.</p>',
                'tech_stack' => ['Flutter', 'Dart', 'Firebase'],
                'status' => 'active',
                'is_featured' => true,
                'is_open_source' => true,
                'stars_count' => 97,
                'forks_count' => 21,
                'repo_url' => 'https://github.com/APEX-Team/campay-mobile',
                'demo_url' => null,
                'tags' => ['flutter'],
                'created_days_ago' => 98,
            ],
            [
                'owner_email' => 'editor@apex.dev',
                'collection_slug' => 'backend-devops-starters',
                'title' => 'DevOps Pipeline Template',
                'slug' => 'devops-pipeline-template',
                'description' => 'Production-ready Docker, GitHub Actions, and zero-downtime deployment templates for Laravel & Spring Boot teams.',
                'long_description' => '<h2>DevOps Pipeline Template</h2><p>Standardizes linting, automated PHPUnit/JUnit runs, multi-stage Docker builds, and health-checked rollouts.</p>',
                'tech_stack' => ['Docker', 'Spring Boot', 'Laravel', 'Nginx'],
                'status' => 'active',
                'is_featured' => false,
                'is_open_source' => true,
                'stars_count' => 63,
                'forks_count' => 18,
                'repo_url' => 'https://github.com/APEX-Team/devops-templates',
                'demo_url' => null,
                'tags' => ['docker', 'spring-boot', 'laravel'],
                'created_days_ago' => 76,
            ],
            [
                'owner_email' => 'admin@apex.dev',
                'collection_slug' => 'apex-core-platform',
                'title' => 'Spring Boot Commerce API',
                'slug' => 'spring-boot-commerce-api',
                'description' => 'Modular e-commerce & POS REST API built with Spring Boot 3, Java 21, Spring Security JWT, and PostgreSQL.',
                'long_description' => '<h2>Spring Boot Commerce API</h2><p>Clean layered architecture backend supporting inventory management, multi-branch orders, JWT authentication, and OpenAPI documentation.</p>',
                'tech_stack' => ['Spring Boot', 'Java', 'PostgreSQL', 'Docker'],
                'status' => 'active',
                'is_featured' => true,
                'is_open_source' => true,
                'stars_count' => 118,
                'forks_count' => 27,
                'repo_url' => 'https://github.com/APEX-Team/spring-boot-commerce-api',
                'demo_url' => null,
                'tags' => ['spring-boot', 'java', 'postgresql', 'docker'],
                'created_days_ago' => 33,
            ],
            [
                'owner_email' => 'member@apex.dev',
                'collection_slug' => 'ui-kits-design-systems',
                'title' => 'React Dashboard Pro',
                'slug' => 'react-dashboard-pro',
                'description' => 'Accessible admin dashboard starter built with React, TypeScript, Chart.js, and Tailwind CSS.',
                'long_description' => '<h2>React Dashboard Pro</h2><p>Includes dark/light theming, responsive sidebar layouts, bilingual i18n setup, and reusable data tables.</p>',
                'tech_stack' => ['React', 'TypeScript', 'Tailwind CSS'],
                'status' => 'active',
                'is_featured' => true,
                'is_open_source' => true,
                'stars_count' => 112,
                'forks_count' => 29,
                'repo_url' => 'https://github.com/APEX-Team/react-dashboard',
                'demo_url' => 'https://dashboard.apex-team.space',
                'tags' => ['react', 'typescript', 'tailwindcss'],
                'created_days_ago' => 58,
            ],
            [
                'owner_email' => 'editor@apex.dev',
                'collection_slug' => 'backend-devops-starters',
                'title' => 'Laravel API Starter',
                'slug' => 'laravel-api-starter',
                'description' => 'Opinionated boilerplate for building secure REST APIs with Laravel 11, Sanctum, PostgreSQL, and RBAC.',
                'long_description' => '<h2>Laravel API Starter</h2><p>Preconfigured with role-based middleware, audit activity logging, rate limiting, and clean JSON API resources.</p>',
                'tech_stack' => ['Laravel', 'PostgreSQL', 'Redis'],
                'status' => 'active',
                'is_featured' => false,
                'is_open_source' => true,
                'stars_count' => 134,
                'forks_count' => 37,
                'repo_url' => 'https://github.com/APEX-Team/laravel-api-starter',
                'demo_url' => null,
                'tags' => ['laravel', 'php', 'postgresql'],
                'created_days_ago' => 41,
            ],
            [
                'owner_email' => 'seanghai@apex.dev',
                'collection_slug' => 'mobile-ai-lab',
                'title' => 'Smart Classroom IoT',
                'slug' => 'smart-classroom-iot',
                'description' => 'IoT telemetry and attendance automation platform for university labs using Python, MQTT, and Raspberry Pi.',
                'long_description' => '<h2>Smart Classroom IoT</h2><p>Monitors energy usage, temperature, and automated RFID check-ins across Norton University computer labs.</p>',
                'tech_stack' => ['Python', 'Raspberry Pi', 'MQTT'],
                'status' => 'wip',
                'is_featured' => false,
                'is_open_source' => true,
                'stars_count' => 28,
                'forks_count' => 7,
                'repo_url' => 'https://github.com/APEX-Team/smart-classroom',
                'demo_url' => null,
                'tags' => ['python'],
                'created_days_ago' => 19,
            ],
            [
                'owner_email' => 'admin@apex.dev',
                'collection_slug' => 'apex-core-platform',
                'title' => 'APEX Docs Engine',
                'slug' => 'apex-docs-engine',
                'description' => 'Hierarchical documentation publishing engine with multi-level navigation menus and instant search.',
                'long_description' => '<h2>APEX Docs Engine</h2><p>Powers technical handbooks with ordered sections, nested menus, and clean reader navigation.</p>',
                'tech_stack' => ['React', 'Laravel', 'PostgreSQL'],
                'status' => 'wip',
                'is_featured' => false,
                'is_open_source' => true,
                'stars_count' => 41,
                'forks_count' => 9,
                'repo_url' => 'https://github.com/APEX-Team/apex-docs-engine',
                'demo_url' => null,
                'tags' => ['react', 'laravel', 'postgresql'],
                'created_days_ago' => 11,
            ],
            [
                'owner_email' => 'member@apex.dev',
                'collection_slug' => 'ui-kits-design-systems',
                'title' => 'Khmer Font Collection',
                'slug' => 'khmer-font-collection',
                'description' => 'Curated directory of open-source Khmer web fonts with CSS snippets and typography previews.',
                'long_description' => '<h2>Khmer Font Collection</h2><p>Helps Cambodian frontend teams pair Kantumruy Pro, Noto Sans Khmer, and display typefaces with optimal line height.</p>',
                'tech_stack' => ['CSS', 'Web Fonts', 'Tailwind CSS'],
                'status' => 'archived',
                'is_featured' => false,
                'is_open_source' => true,
                'stars_count' => 52,
                'forks_count' => 14,
                'repo_url' => 'https://github.com/APEX-Team/khmer-fonts',
                'demo_url' => null,
                'tags' => ['tailwindcss'],
                'created_days_ago' => 160,
            ],
        ];

        foreach ($projects as $projectData) {
            $ownerEmail = $projectData['owner_email'];
            $collectionSlug = $projectData['collection_slug'];
            $tagSlugs = $projectData['tags'] ?? [];
            $daysAgo = $projectData['created_days_ago'];
            unset($projectData['owner_email'], $projectData['collection_slug'], $projectData['tags'], $projectData['created_days_ago']);

            $owner = $usersByEmail->get($ownerEmail) ?? $fallbackUser;
            $projectData['created_by'] = $owner->id;
            $projectData['collection_id'] = $collectionSlug
                ? $collectionsByKey->get($owner->id.':'.$collectionSlug)?->id
                : null;

            $project = Project::withoutEvents(function () use ($projectData, $daysAgo) {
                $existing = Project::withTrashed()->where('slug', $projectData['slug'])->first();
                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->update($projectData);

                    return $existing;
                }

                $created = Project::create($projectData);
                $timestamp = now()->subDays($daysAgo);
                $created->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();

                return $created;
            });

            if ($tagSlugs) {
                $tagIds = Tag::whereIn('slug', $tagSlugs)->pluck('id');
                $project->tags()->sync($tagIds);
            }
        }
    }
}
