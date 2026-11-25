<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Approvals\ApproveRequestAction;
use App\Actions\Approvals\RejectRequestAction;
use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ApprovalRequestResource;
use App\Models\ApprovalRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ApprovalRequest::with(['requester', 'reviewer'])
            ->orderByDesc('created_at');

        if ($status = $request->get('status', ApprovalStatus::Pending->value)) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $items = $query->paginate(20);

        return $this->paginatedResponse($items, ApprovalRequestResource::collection($items));
    }

    public function approve(Request $request, int $id, ApproveRequestAction $action): JsonResponse
    {
        $approvalRequest = ApprovalRequest::where('status', ApprovalStatus::Pending->value)
            ->findOrFail($id);

        $action->execute($approvalRequest, (int) auth()->id(), $request->input('note'));

        return $this->successResponse(message: 'Request approved and applied.');
    }

    public function reject(Request $request, int $id, RejectRequestAction $action): JsonResponse
    {
        $approvalRequest = ApprovalRequest::where('status', ApprovalStatus::Pending->value)
            ->findOrFail($id);

        $action->execute($approvalRequest, (int) auth()->id(), $request->input('note'));

        return $this->successResponse(message: 'Request rejected.');
    }
}
