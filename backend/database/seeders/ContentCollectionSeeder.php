<?php

namespace Database\Seeders;

use App\Models\ContentCollection;
use App\Models\User;
use Illuminate\Database\Seeder;

class ContentCollectionSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first();
        $editor = User::where('email', 'editor@apex.dev')->first();
        $member = User::where('email', 'member@apex.dev')->first();
        $seanghai = User::where('email', 'seanghai@apex.dev')->first();

        $collections = [
            [
                'author' => $admin,
                'name' => 'APEX Core Platform',
                'slug' => 'apex-core-platform',
                'description' => 'Flagship web platforms, documentation hubs, and community tools built by APEX.',
            ],
            [
                'author' => $editor,
                'name' => 'Backend & DevOps Starters',
                'slug' => 'backend-devops-starters',
                'description' => 'Production-ready Laravel boilerplates, PostgreSQL templates, and CI/CD pipelines.',
            ],
            [
                'author' => $member,
                'name' => 'UI Kits & Design Systems',
                'slug' => 'ui-kits-design-systems',
                'description' => 'Reusable React dashboards, component libraries, and Khmer typography collections.',
            ],
            [
                'author' => $seanghai,
                'name' => 'Mobile & AI Lab',
                'slug' => 'mobile-ai-lab',
                'description' => 'Flutter mobile apps, Khmer NLP research tools, and smart IoT prototypes.',
            ],
        ];

        foreach ($collections as $item) {
            if (! $item['author']) {
                continue;
            }

            ContentCollection::updateOrCreate(
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
