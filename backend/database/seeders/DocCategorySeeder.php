<?php

namespace Database\Seeders;

use App\Models\DocCategory;
use Illuminate\Database\Seeder;

class DocCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Getting Started',
            'Platform Guides',
            'API Reference',
            'Deployment & Ops',
        ];

        foreach ($categories as $name) {
            DocCategory::firstOrCreate(['name' => $name]);
        }
    }
}
