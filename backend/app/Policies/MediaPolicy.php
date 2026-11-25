<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Media $media): bool
    {
        return $media->uploaded_by === $user->id;
    }
}
