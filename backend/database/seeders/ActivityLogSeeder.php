<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\BlogPost;
use App\Models\Doc;
use App\Models\Message;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first();
        $editor = User::where('email', 'editor@apex.dev')->first();
        $junior = User::where('email', 'junior.admin@apex.dev')->first();

        if (! $admin) {
            return;
        }

        $apexProject = Project::where('slug', 'apex-website')->first();
        $docsProject = Project::where('slug', 'apex-docs-engine')->first();
        $rbacPost = BlogPost::where('slug', 'designing-rbac-approval-workflows')->first();
        $laravelPost = BlogPost::where('slug', 'building-rest-apis-laravel-11')->first();
        $introDoc = Doc::where('slug', 'introduction-to-apex')->first();
        $acceptedApp = Application::where('status', 'accepted')->first();
        $readMsg = Message::where('is_read', true)->first();

        $entries = [
            [
                'user_id' => $admin->id,
                'action' => 'created',
                'subject_type' => $apexProject ? Project::class : null,
                'subject_id' => $apexProject?->id,
                'description' => 'Created project: APEX Website',
                'properties' => ['slug' => 'apex-website'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 360,
            ],
            [
                'user_id' => $editor?->id ?? $admin->id,
                'action' => 'created',
                'subject_type' => $laravelPost ? BlogPost::class : null,
                'subject_id' => $laravelPost?->id,
                'description' => 'Published blog post: Building Production REST APIs with Laravel 11 & Sanctum',
                'properties' => ['slug' => 'building-rest-apis-laravel-11'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 280,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'updated',
                'subject_type' => $acceptedApp ? Application::class : null,
                'subject_id' => $acceptedApp?->id,
                'description' => 'Updated application status for Chann Vichea to accepted',
                'properties' => ['status' => 'accepted'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 210,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'created',
                'subject_type' => $introDoc ? Doc::class : null,
                'subject_id' => $introDoc?->id,
                'description' => 'Published documentation page: Introduction to APEX Platform',
                'properties' => ['slug' => 'introduction-to-apex'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 160,
            ],
            [
                'user_id' => $editor?->id ?? $admin->id,
                'action' => 'updated',
                'subject_type' => $readMsg ? Message::class : null,
                'subject_id' => $readMsg?->id,
                'description' => 'Marked contact message from Leakhena Ros as read',
                'properties' => ['is_read' => true],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 110,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'created',
                'subject_type' => $rbacPost ? BlogPost::class : null,
                'subject_id' => $rbacPost?->id,
                'description' => 'Published blog post: Designing Role-Based Access Control & Approval Workflows',
                'properties' => ['slug' => 'designing-rbac-approval-workflows'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 72,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'created',
                'subject_type' => $docsProject ? Project::class : null,
                'subject_id' => $docsProject?->id,
                'description' => 'Created project: APEX Docs Engine',
                'properties' => ['slug' => 'apex-docs-engine'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 48,
            ],
            [
                'user_id' => $junior?->id ?? $admin->id,
                'action' => 'created',
                'subject_type' => BlogPost::class,
                'subject_id' => BlogPost::where('slug', 'open-source-contribution-guide')->value('id'),
                'description' => 'Saved draft blog post: Open Source Contribution Playbook for Students',
                'properties' => ['status' => 'draft'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 20,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'approved',
                'subject_type' => Project::class,
                'subject_id' => Project::where('slug', 'devops-pipeline-template')->value('id'),
                'description' => 'Approved update request for Project by Rom Chamraeun',
                'properties' => ['status' => 'approved'],
                'ip_address' => '127.0.0.1',
                'hours_ago' => 6,
            ],
            [
                'user_id' => $admin->id,
                'action' => 'login',
                'subject_type' => User::class,
                'subject_id' => $admin->id,
                'description' => 'Super Admin signed in to dashboard',
                'properties' => null,
                'ip_address' => '127.0.0.1',
                'hours_ago' => 2,
            ],
        ];

        foreach ($entries as $entry) {
            $hoursAgo = $entry['hours_ago'];
            unset($entry['hours_ago']);

            $log = ActivityLog::firstOrCreate(
                [
                    'user_id' => $entry['user_id'],
                    'action' => $entry['action'],
                    'description' => $entry['description'],
                ],
                $entry
            );

            if ($log->wasRecentlyCreated) {
                $timestamp = now()->subHours($hoursAgo);
                $log->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();
            }
        }
    }
}
