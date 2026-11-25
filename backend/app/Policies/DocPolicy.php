<?php

namespace App\Policies;

use App\Models\Doc;
use App\Models\User;

class DocPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Doc $doc): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Doc $doc): bool
    {
        return $user->isAdmin() && ($doc->author_id === null || $doc->author_id === $user->id);
    }

    public function delete(User $user, Doc $doc): bool
    {
        return $user->isAdmin() && ($doc->author_id === null || $doc->author_id === $user->id);
    }
}
