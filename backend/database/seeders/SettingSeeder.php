<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'APEX', 'type' => 'string', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Coding the Universe Since 2024', 'type' => 'string', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'A passionate collective of developers from Cambodia building impactful open-source projects.', 'type' => 'string', 'group' => 'general'],
            ['key' => 'founded_year', 'value' => '2024', 'type' => 'integer', 'group' => 'general'],
            ['key' => 'location', 'value' => 'Phnom Penh, Cambodia', 'type' => 'string', 'group' => 'general'],
            ['key' => 'university', 'value' => 'Norton University', 'type' => 'string', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'apexteam@gmail.com', 'type' => 'string', 'group' => 'social'],
            ['key' => 'github_url', 'value' => 'https://github.com/APEX-Team', 'type' => 'string', 'group' => 'social'],
            ['key' => 'telegram_url', 'value' => 'https://t.me/apexteam', 'type' => 'string', 'group' => 'social'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/apexteamkh', 'type' => 'string', 'group' => 'social'],
            ['key' => 'meta_title', 'value' => 'APEX | Coding the Universe', 'type' => 'string', 'group' => 'seo'],
            ['key' => 'meta_description', 'value' => 'Full-Stack · AI · Cloud · Mobile — Building the Future from Cambodia', 'type' => 'string', 'group' => 'seo'],
            ['key' => 'admin_direct_action', 'value' => '1', 'type' => 'boolean', 'group' => 'permissions'],
            ['key' => 'allowed_storage_providers', 'value' => 'both', 'type' => 'string', 'group' => 'storage'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
