<?php

namespace App\Actions\Approvals;

use App\Enums\ApprovalStatus;
use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Notifications\GeneralNotification;

class RejectRequestAction
{
    public function execute(ApprovalRequest $approvalRequest, int $reviewerId, ?string $note = null): void
    {
        $approvalRequest->update([
            'status' => ApprovalStatus::Rejected->value,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'reviewer_note' => $note,
        ]);

        ActivityLog::log(
            'rejected',
            "Rejected {$approvalRequest->action} request for {$approvalRequest->subjectLabel()} by {$approvalRequest->requester?->name}",
            $approvalRequest
        );

        if ($approvalRequest->requester) {
            $approvalRequest->requester->notify(new GeneralNotification(
                'Approval Request Rejected',
                "Your {$approvalRequest->action} request for {$approvalRequest->subjectLabel()} was rejected.",
                'warning',
                '/admin/dashboard'
            ));
        }
    }
}
