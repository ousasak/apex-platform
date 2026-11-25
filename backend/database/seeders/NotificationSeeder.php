<?php

namespace Database\Seeders;

use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@apex.dev')->first();
        $editor = User::where('email', 'editor@apex.dev')->first();
        $junior = User::where('email', 'junior.admin@apex.dev')->first();
        $member = User::where('email', 'member@apex.dev')->first();

        $records = [
            [
                'id' => '11111111-1111-4111-8111-000000000001',
                'user' => $admin,
                'data' => [
                    'title' => 'New Approval Request Pending',
                    'message' => 'Sokha Dara requested to create tag "Kubernetes". Review it in Approval Requests.',
                    'type' => 'warning',
                    'link' => '/admin/approvals',
                ],
                'read' => false,
                'hours_ago' => 3,
            ],
            [
                'id' => '11111111-1111-4111-8111-000000000002',
                'user' => $admin,
                'data' => [
                    'title' => 'New Team Application Received',
                    'message' => 'Sovannara Keo applied for Frontend Developer.',
                    'type' => 'info',
                    'link' => '/admin/applications',
                ],
                'read' => false,
                'hours_ago' => 14,
            ],
            [
                'id' => '11111111-1111-4111-8111-000000000003',
                'user' => $admin,
                'data' => [
                    'title' => 'Unread Contact Message',
                    'message' => 'Vannak Seng sent a message: "University Tech Talk Collaboration".',
                    'type' => 'info',
                    'link' => '/admin/messages',
                ],
                'read' => true,
                'hours_ago' => 26,
            ],
            [
                'id' => '11111111-1111-4111-8111-000000000004',
                'user' => $editor,
                'data' => [
                    'title' => 'Approval Request Approved',
                    'message' => 'Your update to "DevOps Pipeline Template" was approved by Khat Vanna.',
                    'type' => 'success',
                    'link' => '/admin/projects',
                ],
                'read' => false,
                'hours_ago' => 8,
            ],
            [
                'id' => '11111111-1111-4111-8111-000000000005',
                'user' => $junior,
                'data' => [
                    'title' => 'Approval Request Reviewed',
                    'message' => 'Your delete request for tag "PHP" was declined with a reviewer note.',
                    'type' => 'warning',
                    'link' => '/admin/dashboard',
                ],
                'read' => false,
                'hours_ago' => 12,
            ],
            [
                'id' => '11111111-1111-4111-8111-000000000006',
                'user' => $member,
                'data' => [
                    'title' => 'Welcome to APEX Platform',
                    'message' => 'Your public profile and project portfolio are live. Keep sharing your open-source work!',
                    'type' => 'success',
                    'link' => '/member/profile',
                ],
                'read' => false,
                'hours_ago' => 48,
            ],
        ];

        foreach ($records as $item) {
            if (! $item['user']) {
                continue;
            }

            $timestamp = now()->subHours($item['hours_ago']);

            $exists = DB::table('notifications')->where('id', $item['id'])->exists();
            if (! $exists) {
                DB::table('notifications')->insert([
                    'id' => $item['id'],
                    'type' => GeneralNotification::class,
                    'notifiable_type' => User::class,
                    'notifiable_id' => $item['user']->id,
                    'data' => json_encode($item['data']),
                    'read_at' => $item['read'] ? $timestamp->copy()->addHour() : null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }
}
