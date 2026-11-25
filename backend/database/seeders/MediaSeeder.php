<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\User;
use Illuminate\Database\Seeder;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first() ?? User::first();
        $editor = User::where('email', 'editor@apex.dev')->first() ?? $admin;
        if (! $admin) {
            return;
        }

        $items = [
            [
                'filename' => 'apex-brand-banner.svg',
                'original_name' => 'APEX Brand Banner.svg',
                'path' => 'media/apex-brand-banner.svg',
                'disk' => 'public',
                'mime_type' => 'image/svg+xml',
                'size' => 48200,
                'uploaded_by' => $admin->id,
                'days_ago' => 60,
            ],
            [
                'filename' => 'architecture-diagram-v2.png',
                'original_name' => 'System Architecture Diagram v2.png',
                'path' => 'media/architecture-diagram-v2.png',
                'disk' => 'public',
                'mime_type' => 'image/png',
                'size' => 342500,
                'uploaded_by' => $admin->id,
                'days_ago' => 38,
            ],
            [
                'filename' => 'laravel-rbac-flow.png',
                'original_name' => 'Laravel RBAC Approval Flow.png',
                'path' => 'media/laravel-rbac-flow.png',
                'disk' => 'public',
                'mime_type' => 'image/png',
                'size' => 218400,
                'uploaded_by' => $editor->id,
                'days_ago' => 22,
            ],
            [
                'filename' => 'docker-compose-topology.webp',
                'original_name' => 'Docker Compose Topology.webp',
                'path' => 'media/docker-compose-topology.webp',
                'disk' => 'public',
                'mime_type' => 'image/webp',
                'size' => 156800,
                'uploaded_by' => $editor->id,
                'days_ago' => 15,
            ],
            [
                'filename' => 'apex-contributor-handbook.pdf',
                'original_name' => 'APEX Contributor Handbook 2026.pdf',
                'path' => 'media/apex-contributor-handbook.pdf',
                'disk' => 'public',
                'mime_type' => 'application/pdf',
                'size' => 1248900,
                'uploaded_by' => $admin->id,
                'days_ago' => 7,
            ],
        ];

        foreach ($items as $item) {
            $daysAgo = $item['days_ago'];
            unset($item['days_ago']);

            Media::withoutEvents(function () use ($item, $daysAgo) {
                $media = Media::firstOrCreate(['path' => $item['path']], $item);
                if ($media->wasRecentlyCreated) {
                    $timestamp = now()->subDays($daysAgo);
                    $media->forceFill([
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ])->saveQuietly();
                }
            });
        }
    }
}
