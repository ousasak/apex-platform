<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Application::query();

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $like = '%'.strtolower(trim((string) $search)).'%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(role_applied) LIKE ?', [$like]);
            });
        }

        $applications = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,reviewing,accepted,rejected'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $application = Application::findOrFail($id);
        $application->update($validated);

        ActivityLog::log(
            'updated',
            "Updated application status for {$application->name} to {$application->status}",
            $application
        );

        return response()->json([
            'success' => true,
            'data' => $application,
            'message' => 'Application status updated.',
        ]);
    }
}
