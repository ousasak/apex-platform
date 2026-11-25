<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\SupabaseStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user');

        if ($search = $request->get('search')) {
            $like = '%'.strtolower(trim((string) $search)).'%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(description) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(subject_type) LIKE ?', [$like])
                    ->orWhereHas('user', function ($uq) use ($like) {
                        $uq->whereRaw('LOWER(name) LIKE ?', [$like]);
                    });
            });
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($action = $request->get('action')) {
            $query->where('action', $action);
        }

        $perPage = min(50, max(1, (int) $request->get('per_page', 20)));
        $logs = $query->orderByDesc('created_at')->paginate($perPage);

        $data = collect($logs->items())->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'description' => $log->description,
                'properties' => $log->properties,
                'ip_address' => $log->ip_address,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'avatar' => $log->user->publicAvatarUrl(),
                ] : null,
                'created_at' => $log->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
