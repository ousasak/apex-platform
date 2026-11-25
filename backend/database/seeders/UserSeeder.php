<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'superadmin')->firstOrFail();
        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $memberRole = Role::where('name', 'member')->firstOrFail();
        $guestRole = Role::where('name', 'guest')->firstOrFail();

        $users = [
            [
                'name' => 'Khat Vanna',
                'username' => 'khat_vanna',
                'email' => 'admin@apex.dev',
                'password' => 'password',
                'role_id' => $superAdminRole->id,
                'bio' => 'Founder & Full-Stack Lead at APEX. Architecting open-source platforms and mentoring Cambodian developers.',
                'github_url' => 'https://github.com/khatvanna',
                'linkedin_url' => 'https://linkedin.com/in/khatvanna',
                'is_active' => true,
                'email_verified_at' => now()->subDays(170),
                'created_days_ago' => 170,
            ],
            [
                'name' => 'Rom Chamraeun',
                'username' => 'rom_chamraeun',
                'email' => 'editor@apex.dev',
                'password' => 'password',
                'role_id' => $adminRole->id,
                'bio' => 'Co-Founder & Backend Engineer specializing in Laravel APIs, PostgreSQL, and distributed systems.',
                'github_url' => 'https://github.com/romchamraeun',
                'linkedin_url' => 'https://linkedin.com/in/romchamraeun',
                'is_active' => true,
                'email_verified_at' => now()->subDays(150),
                'created_days_ago' => 150,
            ],
            [
                'name' => 'Sokha Dara',
                'username' => 'sokha_dara',
                'email' => 'junior.admin@apex.dev',
                'password' => 'password',
                'role_id' => $adminRole->id,
                'bio' => 'Content Editor & Community Moderator managing documentation and technical tutorials.',
                'github_url' => 'https://github.com/sokhadara',
                'linkedin_url' => null,
                'is_active' => true,
                'email_verified_at' => now()->subDays(95),
                'created_days_ago' => 95,
            ],
            [
                'name' => 'Phuem Norng',
                'username' => 'phuem_norng',
                'email' => 'member@apex.dev',
                'password' => 'password',
                'role_id' => $memberRole->id,
                'bio' => 'Co-Founder & Frontend Engineer focused on React, TypeScript, and accessible design systems.',
                'github_url' => 'https://github.com/phuemnorng',
                'linkedin_url' => 'https://linkedin.com/in/phuemnorng',
                'is_active' => true,
                'email_verified_at' => now()->subDays(140),
                'created_days_ago' => 140,
            ],
            [
                'name' => 'Pheun Seanghai',
                'username' => 'pheun_seanghai',
                'email' => 'seanghai@apex.dev',
                'password' => 'password',
                'role_id' => $memberRole->id,
                'bio' => 'Co-Founder & Mobile Developer building cross-platform Flutter applications and IoT tools.',
                'github_url' => 'https://github.com/pheunseanghai',
                'linkedin_url' => 'https://linkedin.com/in/pheunseanghai',
                'is_active' => true,
                'email_verified_at' => now()->subDays(120),
                'created_days_ago' => 120,
            ],
            [
                'name' => 'Chann Vichea',
                'username' => 'chann_vichea',
                'email' => 'vichea@apex.dev',
                'password' => 'password',
                'role_id' => $memberRole->id,
                'bio' => 'DevOps & Cloud Engineer automating CI/CD workflows, Docker stacks, and observability.',
                'github_url' => 'https://github.com/channvichea',
                'linkedin_url' => 'https://linkedin.com/in/channvichea',
                'is_active' => true,
                'email_verified_at' => now()->subDays(60),
                'created_days_ago' => 60,
            ],
            [
                'name' => 'Sophea Lim',
                'username' => 'sophea_lim',
                'email' => 'guest@apex.dev',
                'password' => 'password',
                'role_id' => $guestRole->id,
                'bio' => 'Computer science student exploring open-source software in Cambodia.',
                'github_url' => 'https://github.com/sophealim',
                'linkedin_url' => null,
                'is_active' => true,
                'email_verified_at' => now()->subDays(25),
                'created_days_ago' => 25,
            ],
            [
                'name' => 'Rithy Meas',
                'username' => 'rithy_meas',
                'email' => 'inactive@apex.dev',
                'password' => 'password',
                'role_id' => $memberRole->id,
                'bio' => 'Alumni contributor (inactive account).',
                'github_url' => null,
                'linkedin_url' => null,
                'is_active' => false,
                'email_verified_at' => now()->subDays(110),
                'created_days_ago' => 110,
            ],
        ];

        foreach ($users as $userData) {
            $daysAgo = $userData['created_days_ago'];
            unset($userData['created_days_ago']);

            $existing = User::where('email', $userData['email'])->first();
            if ($existing) {
                $existing->update([
                    'name' => $userData['name'],
                    'role_id' => $userData['role_id'],
                    'bio' => $userData['bio'],
                    'github_url' => $userData['github_url'],
                    'linkedin_url' => $userData['linkedin_url'],
                    'is_active' => $userData['is_active'],
                ]);
            } else {
                $user = User::create($userData);
                $createdAt = now()->subDays($daysAgo);
                $user->forceFill([
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])->saveQuietly();
            }
        }
    }
}
