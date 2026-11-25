<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        $usersByEmail = User::whereIn('email', [
            'admin@apex.dev',
            'editor@apex.dev',
            'member@apex.dev',
            'seanghai@apex.dev',
            'vichea@apex.dev',
        ])->get()->keyBy('email');

        $members = [
            [
                'name' => 'Khat Vanna',
                'title' => 'Founder & Full-Stack Developer',
                'bio' => 'Passionate about building impactful software solutions and leading the APEX engineering vision.',
                'email' => 'admin@apex.dev',
                'github_url' => 'https://github.com/khatvanna',
                'linkedin_url' => 'https://linkedin.com/in/khatvanna',
                'telegram_url' => 'https://t.me/khatvanna',
                'is_founder' => true,
                'display_order' => 1,
                'is_visible' => true,
            ],
            [
                'name' => 'Rom Chamraeun',
                'title' => 'Co-Founder & Backend Engineer',
                'bio' => 'Building robust Laravel APIs, scalable PostgreSQL architectures, and developer platforms.',
                'email' => 'editor@apex.dev',
                'github_url' => 'https://github.com/romchamraeun',
                'linkedin_url' => 'https://linkedin.com/in/romchamraeun',
                'telegram_url' => 'https://t.me/romchamraeun',
                'is_founder' => true,
                'display_order' => 2,
                'is_visible' => true,
            ],
            [
                'name' => 'Phuem Norng',
                'title' => 'Co-Founder & Frontend Architect',
                'bio' => 'Focused on clean React architectures, design systems, and crisp user experiences.',
                'email' => 'member@apex.dev',
                'github_url' => 'https://github.com/phuemnorng',
                'linkedin_url' => 'https://linkedin.com/in/phuemnorng',
                'telegram_url' => 'https://t.me/phuemnorng',
                'is_founder' => true,
                'display_order' => 3,
                'is_visible' => true,
            ],
            [
                'name' => 'Pheun Seanghai',
                'title' => 'Co-Founder & Mobile Developer',
                'bio' => 'Crafting cross-platform Flutter apps and experimenting with open-source IoT systems.',
                'email' => 'seanghai@apex.dev',
                'github_url' => 'https://github.com/pheunseanghai',
                'linkedin_url' => 'https://linkedin.com/in/pheunseanghai',
                'telegram_url' => 'https://t.me/pheunseanghai',
                'is_founder' => true,
                'display_order' => 4,
                'is_visible' => true,
            ],
            [
                'name' => 'Chann Vichea',
                'title' => 'DevOps & Cloud Engineer',
                'bio' => 'Automating container pipelines, Kubernetes deployments, and platform observability.',
                'email' => 'vichea@apex.dev',
                'github_url' => 'https://github.com/channvichea',
                'linkedin_url' => 'https://linkedin.com/in/channvichea',
                'telegram_url' => 'https://t.me/channvichea',
                'is_founder' => false,
                'display_order' => 5,
                'is_visible' => true,
            ],
        ];

        foreach ($members as $member) {
            $member['user_id'] = $usersByEmail->get($member['email'])?->id;
            TeamMember::updateOrCreate(['email' => $member['email']], $member);
        }
    }
}
