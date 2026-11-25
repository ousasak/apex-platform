<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $posts = BlogPost::where('status', 'published')->get()->keyBy('slug');
        $users = User::all()->keyBy('email');

        $launchPost = $posts->get('apex-launch');
        $laravelPost = $posts->get('building-rest-apis-laravel-11');
        $rbacPost = $posts->get('designing-rbac-approval-workflows');

        if ($launchPost) {
            $parent = Comment::firstOrCreate(
                [
                    'blog_post_id' => $launchPost->id,
                    'body' => 'Congrats on launching APEX! Excited to follow your open-source releases from Phnom Penh.',
                ],
                [
                    'user_id' => $users->get('guest@apex.dev')?->id,
                    'is_approved' => true,
                    'parent_id' => null,
                ]
            );

            Comment::firstOrCreate(
                [
                    'blog_post_id' => $launchPost->id,
                    'body' => 'Thank you! Feel free to open an issue or join our community sprints anytime.',
                ],
                [
                    'user_id' => $users->get('admin@apex.dev')?->id,
                    'is_approved' => true,
                    'parent_id' => $parent->id,
                ]
            );
        }

        if ($laravelPost) {
            Comment::firstOrCreate(
                [
                    'blog_post_id' => $laravelPost->id,
                    'body' => 'Super clean Sanctum + Resource breakdown. The ownership checks tip saved us from an IDOR bug.',
                ],
                [
                    'user_id' => $users->get('member@apex.dev')?->id,
                    'is_approved' => true,
                    'parent_id' => null,
                ]
            );

            Comment::firstOrCreate(
                [
                    'blog_post_id' => $laravelPost->id,
                    'body' => 'Would love a follow-up post covering rate limiting with Redis in production!',
                ],
                [
                    'user_id' => null,
                    'guest_name' => 'Dara Sok',
                    'guest_email' => 'dara.sok@example.com',
                    'is_approved' => true,
                    'parent_id' => null,
                ]
            );
        }

        if ($rbacPost) {
            Comment::firstOrCreate(
                [
                    'blog_post_id' => $rbacPost->id,
                    'body' => 'Observer-based approval interception is such a neat pattern for multi-admin CMS teams.',
                ],
                [
                    'user_id' => $users->get('vichea@apex.dev')?->id,
                    'is_approved' => true,
                    'parent_id' => null,
                ]
            );

            Comment::firstOrCreate(
                [
                    'blog_post_id' => $rbacPost->id,
                    'body' => 'Is there a webhook option when a new approval request is created?',
                ],
                [
                    'user_id' => null,
                    'guest_name' => 'Visal Chan',
                    'guest_email' => 'visal.chan@example.com',
                    'is_approved' => false,
                    'parent_id' => null,
                ]
            );
        }
    }
}
