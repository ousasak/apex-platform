<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Database\Seeder;

class UserPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $editor = User::where('email', 'editor@apex.dev')->first();
        $juniorAdmin = User::where('email', 'junior.admin@apex.dev')->first();

        $resources = ['projects', 'categories', 'tags', 'team_members', 'blog_posts', 'media'];

        if ($editor) {
            foreach ($resources as $resource) {
                UserPermission::updateOrCreate(
                    ['user_id' => $editor->id, 'resource' => $resource],
                    [
                        'can_create' => true,
                        'can_update' => true,
                        'can_delete' => in_array($resource, ['tags', 'media'], true),
                    ]
                );
            }
        }

        if ($juniorAdmin) {
            foreach ($resources as $resource) {
                UserPermission::updateOrCreate(
                    ['user_id' => $juniorAdmin->id, 'resource' => $resource],
                    [
                        'can_create' => $resource === 'blog_posts',
                        'can_update' => false,
                        'can_delete' => false,
                    ]
                );
            }
        }
    }
}
