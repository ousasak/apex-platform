<?php

namespace Database\Seeders;

use App\Models\DocMenu;
use Illuminate\Database\Seeder;

class DocMenuSeeder extends Seeder
{
    public function run(): void
    {
        $gettingStarted = DocMenu::updateOrCreate(
            ['slug' => 'getting-started'],
            [
                'name' => 'Getting Started',
                'description' => 'Introduction, local setup, and workspace prerequisites.',
                'order_num' => 1,
                'parent_id' => null,
            ]
        );

        $guides = DocMenu::updateOrCreate(
            ['slug' => 'platform-guides'],
            [
                'name' => 'Platform Guides',
                'description' => 'Authentication, RBAC permissions, and content workflows.',
                'order_num' => 2,
                'parent_id' => null,
            ]
        );

        $apiRef = DocMenu::updateOrCreate(
            ['slug' => 'api-reference'],
            [
                'name' => 'API Reference',
                'description' => 'REST endpoints, authentication headers, and pagination contracts.',
                'order_num' => 3,
                'parent_id' => null,
            ]
        );

        $submenus = [
            [
                'slug' => 'local-setup',
                'name' => 'Local Setup',
                'description' => 'Docker Compose and native environment setup.',
                'order_num' => 1,
                'parent_id' => $gettingStarted->id,
            ],
            [
                'slug' => 'auth-and-rbac',
                'name' => 'Auth & RBAC',
                'description' => 'Sanctum tokens, roles, permissions, and approval queues.',
                'order_num' => 1,
                'parent_id' => $guides->id,
            ],
            [
                'slug' => 'content-management',
                'name' => 'Content Management',
                'description' => 'Projects, blog series, media uploads, and documentation trees.',
                'order_num' => 2,
                'parent_id' => $guides->id,
            ],
            [
                'slug' => 'public-endpoints',
                'name' => 'Public Endpoints',
                'description' => 'Read-only public API endpoints and caching semantics.',
                'order_num' => 1,
                'parent_id' => $apiRef->id,
            ],
        ];

        foreach ($submenus as $submenu) {
            DocMenu::updateOrCreate(['slug' => $submenu['slug']], $submenu);
        }
    }
}
