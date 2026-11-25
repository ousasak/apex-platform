<?php

namespace Database\Seeders;

use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $messages = [
            [
                'name' => 'Vannak Seng',
                'email' => 'vannak.seng@norton-u.edu.kh',
                'subject' => 'University Tech Talk Collaboration',
                'body' => 'Hello APEX team, we would love to invite your founders to speak at our Computer Science Open Source Day next month.',
                'is_read' => false,
                'replied_at' => null,
                'days_ago' => 1,
            ],
            [
                'name' => 'Sreyneang Pov',
                'email' => 'sreyneang.pov@techkh.org',
                'subject' => 'Khmer NLP Dataset Partnership',
                'body' => 'Hi! Our research group is using your Khmer NLP Toolkit and would like to contribute 50,000 annotated sentences under MIT license.',
                'is_read' => false,
                'replied_at' => null,
                'days_ago' => 3,
            ],
            [
                'name' => 'Makara Tan',
                'email' => 'makara.tan@startup.kh',
                'subject' => 'Question about Laravel API Starter License',
                'body' => 'Can we use the APEX Laravel API Starter template in a commercial SaaS product with attribution?',
                'is_read' => false,
                'replied_at' => null,
                'days_ago' => 6,
            ],
            [
                'name' => 'Leakhena Ros',
                'email' => 'leakhena.ros@devcommunity.kh',
                'subject' => 'BarCamp Phnom Penh Booth Registration',
                'body' => 'Confirming your open-source showcase booth at BarCamp Phnom Penh. Please send your banner assets by Friday.',
                'is_read' => true,
                'replied_at' => now()->subDays(18),
                'days_ago' => 20,
            ],
            [
                'name' => 'Ratanak Chum',
                'email' => 'ratanak.chum@example.com',
                'subject' => 'Bug Report on Docs Search Mobile View',
                'body' => 'Thanks for the great docs portal! Just flagging that the search dialog looked slightly tight on iPhone SE.',
                'is_read' => true,
                'replied_at' => now()->subDays(41),
                'days_ago' => 42,
            ],
            [
                'name' => 'Malis Heng',
                'email' => 'malis.heng@example.com',
                'subject' => 'Sponsorship Inquiry for Student Hackathon',
                'body' => 'We are organizing a 48-hour student hackathon in Phnom Penh and would love APEX as a technical mentor partner.',
                'is_read' => true,
                'replied_at' => null,
                'days_ago' => 78,
            ],
        ];

        foreach ($messages as $msgData) {
            $daysAgo = $msgData['days_ago'];
            unset($msgData['days_ago']);

            $msg = Message::firstOrCreate(
                [
                    'email' => $msgData['email'],
                    'subject' => $msgData['subject'],
                ],
                $msgData
            );

            if ($msg->wasRecentlyCreated) {
                $timestamp = now()->subDays($daysAgo);
                $msg->forceFill([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])->saveQuietly();
            }
        }
    }
}
