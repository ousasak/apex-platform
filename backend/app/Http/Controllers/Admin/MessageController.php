<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Message::query();

        if ($request->has('read')) {
            $query->where('is_read', $request->boolean('read'));
        }

        if ($search = $request->get('search')) {
            $like = '%'.strtolower(trim((string) $search)).'%';
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(subject) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
            });
        }

        $messages = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    public function markRead(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);
        $message->update(['is_read' => true]);

        ActivityLog::log('updated', "Marked message from {$message->name} as read", $message);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);
        $sender = $message->name;
        $message->delete();

        ActivityLog::log('deleted', "Deleted contact message from {$sender}");

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully.',
        ]);
    }
}
