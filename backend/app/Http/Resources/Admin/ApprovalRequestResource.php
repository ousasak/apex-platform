<?php

namespace App\Http\Resources\Admin;

use App\Models\ApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ApprovalRequest */
class ApprovalRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'subject_type' => $this->subjectLabel(),
            'subject_id' => $this->subject_id,
            'subject_title' => $this->payload['title'] ?? $this->payload['name'] ?? "#{$this->subject_id}",
            'payload' => $this->payload,
            'status' => $this->status,
            'reviewer_note' => $this->reviewer_note,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'requester' => $this->requester ? [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
            ] : null,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
        ];
    }
}
