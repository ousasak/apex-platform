<?php

namespace Database\Seeders;

use App\Models\ApprovalRequest;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApprovalRequestSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::where('email', 'admin@apex.dev')->first();
        $editor = User::where('email', 'editor@apex.dev')->first();
        $juniorAdmin = User::where('email', 'junior.admin@apex.dev')->first();

        if (! $superAdmin || ! $juniorAdmin) {
            return;
        }

        $sampleProject = Project::where('slug', 'devops-pipeline-template')->first();
        $samplePost = BlogPost::where('slug', 'flutter-mobile-development-guide')->first();
        $tutorialCat = BlogCategory::where('slug', 'tutorial')->first();
        $sampleTag = Tag::where('slug', 'php')->first();

        $requests = [
            [
                'requested_by' => $juniorAdmin->id,
                'reviewed_by' => null,
                'action' => 'create',
                'subject_type' => Tag::class,
                'subject_id' => null,
                'payload' => [
                    'name' => 'Kubernetes',
                    'slug' => 'kubernetes',
                    'color' => '#326ce5',
                ],
                'status' => 'pending',
                'reviewer_note' => null,
                'reviewed_at' => null,
                'days_ago' => 1,
            ],
            [
                'requested_by' => $juniorAdmin->id,
                'reviewed_by' => null,
                'action' => 'update',
                'subject_type' => BlogPost::class,
                'subject_id' => $samplePost?->id,
                'payload' => [
                    'title' => 'Flutter Cross-Platform Mobile Architecture Guide',
                    'status' => 'published',
                    'reading_time' => 11,
                ],
                'status' => 'pending',
                'reviewer_note' => null,
                'reviewed_at' => null,
                'days_ago' => 2,
            ],
            [
                'requested_by' => $editor?->id ?? $juniorAdmin->id,
                'reviewed_by' => $superAdmin->id,
                'action' => 'update',
                'subject_type' => Project::class,
                'subject_id' => $sampleProject?->id,
                'payload' => [
                    'title' => 'DevOps Pipeline Template',
                    'is_featured' => true,
                    'stars_count' => 63,
                ],
                'status' => 'approved',
                'reviewer_note' => 'Verified CI workflow documentation and approved update.',
                'reviewed_at' => now()->subDays(9),
                'days_ago' => 10,
            ],
            [
                'requested_by' => $juniorAdmin->id,
                'reviewed_by' => $superAdmin->id,
                'action' => 'delete',
                'subject_type' => Tag::class,
                'subject_id' => $sampleTag?->id,
                'payload' => [
                    'id' => $sampleTag?->id,
                    'title' => $sampleTag?->name ?? 'PHP',
                ],
                'status' => 'rejected',
                'reviewer_note' => 'Keep PHP tag for active Laravel backend project references.',
                'reviewed_at' => now()->subDays(16),
                'days_ago' => 17,
            ],
            [
                'requested_by' => $juniorAdmin->id,
                'reviewed_by' => $superAdmin->id,
                'action' => 'create',
                'subject_type' => BlogCategory::class,
                'subject_id' => $tutorialCat?->id,
                'payload' => [
                    'name' => 'DevOps',
                    'slug' => 'devops',
                    'description' => 'Docker, CI/CD automation, and cloud infrastructure guides',
                    'color' => '#ec4899',
                ],
                'status' => 'approved',
                'reviewer_note' => 'Great category addition for upcoming infrastructure articles.',
                'reviewed_at' => now()->subDays(28),
                'days_ago' => 29,
            ],
        ];

        foreach ($requests as $item) {
            $daysAgo = $item['days_ago'];
            unset($item['days_ago']);

            if ($item['action'] !== 'create' && ! $item['subject_id']) {
                continue;
            }

            $record = ApprovalRequest::firstOrCreate(
                [
                    'requested_by' => $item['requested_by'],
                    'action' => $item['action'],
                    'subject_type' => $item['subject_type'],
                    'subject_id' => $item['subject_id'],
                    'status' => $item['status'],
                ],
                $item
            );

            if ($record->wasRecentlyCreated) {
                $timestamp = now()->subDays($daysAgo);
                $record->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $item['reviewed_at'] ?? $timestamp,
                ])->saveQuietly();
            }
        }
    }
}
