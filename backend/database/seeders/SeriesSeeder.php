<?php

namespace Database\Seeders;

use App\Models\Series;
use App\Models\User;
use Illuminate\Database\Seeder;

class SeriesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first();
        $editor = User::where('email', 'editor@apex.dev')->first();
        $member = User::where('email', 'member@apex.dev')->first();

        $seriesList = [
            [
                'author' => $admin,
                'name' => 'Full-Stack Architecture with Laravel & React',
                'slug' => 'fullstack-laravel-react',
                'description' => 'End-to-end engineering series covering API architecture, authentication, RBAC, and SPA performance.',
            ],
            [
                'author' => $editor,
                'name' => 'PostgreSQL & Backend Mastery',
                'slug' => 'postgresql-backend-mastery',
                'description' => 'Deep dives into relational schema design, indexing, query optimization, and Laravel 11 internals.',
            ],
            [
                'author' => $editor,
                'name' => 'DevOps & Containerization Playbook',
                'slug' => 'devops-containerization-playbook',
                'description' => 'Practical Docker, Nginx, and automated CI/CD deployment workflows for production teams.',
            ],
            [
                'author' => $member,
                'name' => 'Modern Frontend Craft',
                'slug' => 'modern-frontend-craft',
                'description' => 'Component patterns, Tailwind CSS architecture, accessibility, and responsive interfaces.',
            ],
        ];

        foreach ($seriesList as $item) {
            if (! $item['author']) {
                continue;
            }

            Series::updateOrCreate(
                [
                    'author_id' => $item['author']->id,
                    'slug' => $item['slug'],
                ],
                [
                    'name' => $item['name'],
                    'description' => $item['description'],
                ]
            );
        }
    }
}
