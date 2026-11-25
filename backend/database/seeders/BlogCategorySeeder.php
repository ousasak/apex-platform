<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Tutorial', 'slug' => 'tutorial', 'description' => 'Step-by-step guides and hands-on engineering tutorials', 'color' => '#7b2fff'],
            ['name' => 'Development', 'slug' => 'development', 'description' => 'Full-stack development tips, patterns, and best practices', 'color' => '#00d4ff'],
            ['name' => 'Announcement', 'slug' => 'announcement', 'description' => 'Team releases, milestones, and community announcements', 'color' => '#10b981'],
            ['name' => 'Architecture', 'slug' => 'architecture', 'description' => 'System design, database modeling, and scalability deep dives', 'color' => '#f59e0b'],
            ['name' => 'DevOps', 'slug' => 'devops', 'description' => 'Docker, CI/CD automation, and cloud infrastructure guides', 'color' => '#ec4899'],
        ];

        foreach ($categories as $cat) {
            BlogCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
