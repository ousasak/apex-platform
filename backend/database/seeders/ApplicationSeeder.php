<?php

namespace Database\Seeders;

use App\Models\Application;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $applications = [
            [
                'name' => 'Sovannara Keo',
                'email' => 'sovannara.keo@example.com',
                'github_url' => 'https://github.com/sovannarakeo',
                'linkedin_url' => 'https://linkedin.com/in/sovannarakeo',
                'role_applied' => 'Frontend Developer',
                'motivation' => 'I love building fast, accessible React applications and want to contribute to Cambodian open-source software with APEX.',
                'skills' => 'React, TypeScript, Tailwind CSS, Vite, Figma',
                'portfolio_url' => 'https://sovannara.dev',
                'status' => 'pending',
                'admin_notes' => null,
                'days_ago' => 2,
            ],
            [
                'name' => 'Bopha Sreang',
                'email' => 'bopha.sreang@example.com',
                'github_url' => 'https://github.com/bophasreang',
                'linkedin_url' => 'https://linkedin.com/in/bophasreang',
                'role_applied' => 'Backend Developer',
                'motivation' => 'Passionate about Laravel, PostgreSQL performance tuning, and clean RESTful API design.',
                'skills' => 'PHP 8, Laravel 11, PostgreSQL, Redis, Docker',
                'portfolio_url' => 'https://bopha.io',
                'status' => 'pending',
                'admin_notes' => null,
                'days_ago' => 5,
            ],
            [
                'name' => 'Piseth Nhem',
                'email' => 'piseth.nhem@example.com',
                'github_url' => 'https://github.com/pisethnhem',
                'linkedin_url' => 'https://linkedin.com/in/pisethnhem',
                'role_applied' => 'Mobile Developer',
                'motivation' => 'Built two Flutter campus apps at university and eager to collaborate on CamPay Mobile.',
                'skills' => 'Flutter, Dart, Firebase, REST APIs, Riverpod',
                'portfolio_url' => 'https://piseth.app',
                'status' => 'reviewing',
                'admin_notes' => 'Strong Flutter portfolio; technical interview scheduled for Friday.',
                'days_ago' => 14,
            ],
            [
                'name' => 'Kanha Meas',
                'email' => 'kanha.meas@example.com',
                'github_url' => 'https://github.com/kanhameas',
                'linkedin_url' => 'https://linkedin.com/in/kanhameas',
                'role_applied' => 'UI/UX Designer',
                'motivation' => 'Focused on Khmer typography legibility and cohesive design systems for developer tools.',
                'skills' => 'Figma, Design Systems, Prototyping, CSS, Accessibility',
                'portfolio_url' => 'https://kanhadesign.co',
                'status' => 'reviewing',
                'admin_notes' => 'Impressive case studies on bilingual UX.',
                'days_ago' => 24,
            ],
            [
                'name' => 'Chann Vichea',
                'email' => 'vichea@apex.dev',
                'github_url' => 'https://github.com/channvichea',
                'linkedin_url' => 'https://linkedin.com/in/channvichea',
                'role_applied' => 'DevOps Engineer',
                'motivation' => 'Want to help APEX automate CI/CD, Docker builds, and monitoring pipelines.',
                'skills' => 'Docker, GitHub Actions, Linux, Nginx, PostgreSQL, Terraform',
                'portfolio_url' => 'https://vichea.cloud',
                'status' => 'accepted',
                'admin_notes' => 'Accepted and onboarded to the core engineering team.',
                'days_ago' => 65,
            ],
            [
                'name' => 'Darith Chhim',
                'email' => 'darith.chhim@example.com',
                'github_url' => 'https://github.com/darithchhim',
                'linkedin_url' => null,
                'role_applied' => 'Full-Stack Developer',
                'motivation' => 'Interested in contributing to web projects during weekends.',
                'skills' => 'HTML, CSS, Basic JavaScript',
                'portfolio_url' => null,
                'status' => 'rejected',
                'admin_notes' => 'Encouraged to build two portfolio repos and reapply next semester.',
                'days_ago' => 92,
            ],
        ];

        foreach ($applications as $appData) {
            $daysAgo = $appData['days_ago'];
            unset($appData['days_ago']);

            $app = Application::firstOrCreate(
                [
                    'email' => $appData['email'],
                    'role_applied' => $appData['role_applied'],
                ],
                $appData
            );

            if ($app->wasRecentlyCreated) {
                $timestamp = now()->subDays($daysAgo);
                $app->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();
            }
        }
    }
}
