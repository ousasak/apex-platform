<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        // Remove deprecated tags and small non-core tools
        Tag::whereIn('slug', [
            'vuejs',
            'nodejs',
            'ai-ml',
            'vite',
            'postman',
            'vercel',
            'git',
            'html5',
            'css',
            'jquery',
        ])->delete();

        $tags = [
            // Frontend & UI Ecosystem
            [
                'name' => 'React',
                'slug' => 'react',
                'color' => '#61dafb',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
            ],
            [
                'name' => 'TypeScript',
                'slug' => 'typescript',
                'color' => '#007acc',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
            ],
            [
                'name' => 'JavaScript',
                'slug' => 'javascript',
                'color' => '#f7df1e',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
            ],
            [
                'name' => 'Tailwind CSS',
                'slug' => 'tailwindcss',
                'color' => '#06b6d4',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
            ],
            [
                'name' => 'shadcn/ui',
                'slug' => 'shadcn-ui',
                'color' => '#09090b',
                'logo' => 'https://cdn.simpleicons.org/shadcnui/09090b',
            ],
            [
                'name' => 'Ant Design',
                'slug' => 'ant-design',
                'color' => '#0170fe',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/antdesign/antdesign-original.svg',
            ],
            [
                'name' => 'Bootstrap',
                'slug' => 'bootstrap',
                'color' => '#7952b3',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
            ],

            // Backend Frameworks
            [
                'name' => 'Spring Boot',
                'slug' => 'spring-boot',
                'color' => '#6db33f',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
            ],
            [
                'name' => 'Laravel',
                'slug' => 'laravel',
                'color' => '#ff2d20',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
            ],
            [
                'name' => 'ASP.NET Core',
                'slug' => 'aspnet-core',
                'color' => '#512bd4',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg',
            ],
            [
                'name' => 'Django',
                'slug' => 'django',
                'color' => '#092e20',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
            ],

            // Mobile Development
            [
                'name' => 'Flutter',
                'slug' => 'flutter',
                'color' => '#02569b',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
            ],
            [
                'name' => 'Dart',
                'slug' => 'dart',
                'color' => '#0175c2',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
            ],

            // Programming Languages
            [
                'name' => 'Java',
                'slug' => 'java',
                'color' => '#ed8b00',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
            ],
            [
                'name' => 'PHP',
                'slug' => 'php',
                'color' => '#777bb4',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
            ],
            [
                'name' => 'C#',
                'slug' => 'csharp',
                'color' => '#239120',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
            ],
            [
                'name' => 'Python',
                'slug' => 'python',
                'color' => '#3776ab',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
            ],
            [
                'name' => 'C',
                'slug' => 'c',
                'color' => '#a8b9cc',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
            ],
            [
                'name' => 'C++',
                'slug' => 'cpp',
                'color' => '#00599c',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
            ],

            // Databases & DevOps
            [
                'name' => 'PostgreSQL',
                'slug' => 'postgresql',
                'color' => '#4169e1',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
            ],
            [
                'name' => 'MySQL',
                'slug' => 'mysql',
                'color' => '#4479a1',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
            ],
            [
                'name' => 'SQL Server',
                'slug' => 'sql-server',
                'color' => '#cc292b',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-original.svg',
            ],
            [
                'name' => 'Docker',
                'slug' => 'docker',
                'color' => '#2496ed',
                'logo' => 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
            ],
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(['slug' => $tag['slug']], $tag);
        }
    }
}
