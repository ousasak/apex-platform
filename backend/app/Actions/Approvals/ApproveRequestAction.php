<?php

namespace App\Actions\Approvals;

use App\Enums\ApprovalStatus;
use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Project;
use App\Models\Tag;
use App\Models\TeamMember;
use App\Notifications\GeneralNotification;
use App\Support\PublicApiCache;
use Illuminate\Support\Facades\DB;

class ApproveRequestAction
{
    public function execute(ApprovalRequest $approvalRequest, int $reviewerId, ?string $note = null): void
    {
        DB::transaction(function () use ($approvalRequest, $reviewerId, $note) {
            $this->applyAction($approvalRequest);

            $approvalRequest->update([
                'status' => ApprovalStatus::Approved->value,
                'reviewed_by' => $reviewerId,
                'reviewed_at' => now(),
                'reviewer_note' => $note,
            ]);

            ActivityLog::log(
                'approved',
                "Approved {$approvalRequest->action} request for {$approvalRequest->subjectLabel()} by {$approvalRequest->requester?->name}",
                $approvalRequest
            );
        });

        $this->invalidateCachesFor($approvalRequest);

        if ($approvalRequest->requester) {
            $approvalRequest->requester->notify(new GeneralNotification(
                'Approval Request Approved',
                "Your {$approvalRequest->action} request for {$approvalRequest->subjectLabel()} was approved.",
                'success',
                '/admin/dashboard'
            ));
        }
    }

    private function applyAction(ApprovalRequest $approvalRequest): void
    {
        $modelClass = $approvalRequest->subject_type;
        $payload = $approvalRequest->payload ?? [];

        if ($modelClass === Project::class && isset($payload['tech_stack']) && is_string($payload['tech_stack'])) {
            $decoded = json_decode($payload['tech_stack'], true);
            if (is_array($decoded)) {
                $payload['tech_stack'] = $decoded;
            }
        }

        match ($approvalRequest->action) {
            'create' => $modelClass::withoutEvents(fn () => $modelClass::create($payload)),
            'update' => $modelClass::withoutEvents(function () use ($modelClass, $approvalRequest, $payload) {
                $model = $modelClass::findOrFail($approvalRequest->subject_id);
                $model->update($payload);
            }),
            'delete' => $modelClass::withoutEvents(function () use ($modelClass, $approvalRequest) {
                $model = $modelClass::findOrFail($approvalRequest->subject_id);
                $model->delete();
            }),
            default => throw new \InvalidArgumentException("Unknown action: {$approvalRequest->action}"),
        };
    }

    private function invalidateCachesFor(ApprovalRequest $approvalRequest): void
    {
        match ($approvalRequest->subject_type) {
            Project::class => PublicApiCache::forgetProjects(),
            BlogPost::class, BlogCategory::class => PublicApiCache::forgetBlog(),
            Tag::class => PublicApiCache::forgetTags(),
            TeamMember::class => PublicApiCache::forgetTeam(),
            default => PublicApiCache::forgetStats(),
        };
    }
}
