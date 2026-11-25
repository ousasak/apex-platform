<?php

namespace App\Observers\Concerns;

use App\Exceptions\ActionInterceptedException;
use App\Models\ApprovalRequest;
use App\Models\User;
use App\Models\UserPermission;
use App\Notifications\GeneralNotification;
use Illuminate\Database\Eloquent\Model;

/**
 * Used by observers on Project, Tag, BlogCategory, TeamMember, BlogPost, and Media.
 * When an admin lacks the per-resource permission, the mutation is intercepted
 * and queued as a pending approval request for Super Admin review.
 *
 * Each concrete observer must declare:
 *   protected string $resource = 'projects'; // or 'categories', 'tags', 'team_members', 'blog_posts', 'media'
 */
trait InterceptsAdminActions
{
    /**
     * Returns true if the action should be intercepted (queued for approval).
     * $action: 'create' | 'update' | 'delete'
     */
    private function shouldIntercept(string $action): bool
    {
        $user = request()->user();

        if (! $user || ! $user->isAdmin()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return false;
        }

        $permission = UserPermission::where('user_id', $user->id)
            ->where('resource', $this->resource)
            ->first();

        $column = 'can_'.$action;

        return ! ($permission?->$column ?? false);
    }

    private function extractNormalizedAttributes(Model $model, array $rawAttributes): array
    {
        $normalized = [];
        foreach ($rawAttributes as $key => $value) {
            // Avoid double-encoding JSON/array cast attributes when stored into approval_requests.payload
            $normalized[$key] = $model->hasCast($key, ['array', 'json', 'object', 'collection'])
                ? $model->getAttribute($key)
                : $value;
        }

        return $normalized;
    }

    private function notifySuperAdmins(ApprovalRequest $approvalRequest): void
    {
        $requesterName = request()->user()?->name ?? 'An admin';
        $label = $approvalRequest->subjectLabel();

        User::where('is_active', true)
            ->whereHas('role', fn ($q) => $q->where('name', 'superadmin'))
            ->get()
            ->each(fn (User $superAdmin) => $superAdmin->notify(new GeneralNotification(
                'Approval Request Pending',
                "{$requesterName} requested to {$approvalRequest->action} {$label}.",
                'warning',
                '/admin/approvals'
            )));
    }

    public function creating(Model $model): void
    {
        if (! $this->shouldIntercept('create')) {
            return;
        }

        $approval = ApprovalRequest::create([
            'requested_by' => request()->user()->id,
            'action' => 'create',
            'subject_type' => get_class($model),
            'subject_id' => null,
            'payload' => $this->extractNormalizedAttributes($model, $model->getAttributes()),
            'status' => 'pending',
        ]);

        $this->notifySuperAdmins($approval);

        throw new ActionInterceptedException;
    }

    public function updating(Model $model): void
    {
        if (! $this->shouldIntercept('update')) {
            return;
        }

        $approval = ApprovalRequest::create([
            'requested_by' => request()->user()->id,
            'action' => 'update',
            'subject_type' => get_class($model),
            'subject_id' => $model->getKey(),
            'payload' => $this->extractNormalizedAttributes($model, $model->getDirty()),
            'status' => 'pending',
        ]);

        $this->notifySuperAdmins($approval);

        throw new ActionInterceptedException;
    }

    public function deleting(Model $model): void
    {
        if (! $this->shouldIntercept('delete')) {
            return;
        }

        $approval = ApprovalRequest::create([
            'requested_by' => request()->user()->id,
            'action' => 'delete',
            'subject_type' => get_class($model),
            'subject_id' => $model->getKey(),
            'payload' => ['id' => $model->getKey(), 'title' => $model->title ?? $model->name ?? $model->original_name ?? $model->getKey()],
            'status' => 'pending',
        ]);

        $this->notifySuperAdmins($approval);

        throw new ActionInterceptedException;
    }
}
