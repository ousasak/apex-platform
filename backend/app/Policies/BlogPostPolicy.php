<?php

namespace App\Policies;

use App\Models\BlogPost;
use App\Models\User;

class BlogPostPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, BlogPost $post): bool
    {
        return $user->isAdmin() && $post->author_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, BlogPost $post): bool
    {
        return $user->isAdmin() && $post->author_id === $user->id;
    }

    public function delete(User $user, BlogPost $post): bool
    {
        return $user->isAdmin() && $post->author_id === $user->id;
    }
}
