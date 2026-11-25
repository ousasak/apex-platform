<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // A. Master & Reference Data
            RoleSeeder::class,
            SettingSeeder::class,
            BlogCategorySeeder::class,
            TagSeeder::class,
            DocCategorySeeder::class,
            DocMenuSeeder::class,

            // B. Users, Permissions & Team Profiles
            UserSeeder::class,
            UserPermissionSeeder::class,
            TeamMemberSeeder::class,

            // C. Content Groupings & Core Content
            SeriesSeeder::class,
            ContentCollectionSeeder::class,
            ProjectSeeder::class,
            BlogPostSeeder::class,
            CommentSeeder::class,
            DocSeeder::class,
            MediaSeeder::class,

            // D. Operational, Workflow & Audit Data
            ApplicationSeeder::class,
            MessageSeeder::class,
            ApprovalRequestSeeder::class,
            ActivityLogSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
