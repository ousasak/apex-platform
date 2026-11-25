<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Project $project): bool
    {
        return $user->isAdmin() && $project->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Project $project): bool
    {
        return $user->isAdmin() && $project->created_by === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->isAdmin() && $project->created_by === $user->id;
    }
}
