<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    private const SYSTEM_ROLES = ['superadmin', 'admin', 'member', 'guest'];

    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')
            ->with(['users' => function ($query) {
                $query->select('id', 'name', 'username', 'avatar', 'avatar_disk', 'role_id')
                    ->orderBy('id')
                    ->limit(5);
            }])
            ->orderBy('id')
            ->get()
            ->map(function (Role $role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'users_count' => $role->users_count,
                    'is_system' => in_array($role->name, self::SYSTEM_ROLES, true),
                    'sample_users' => $role->users->map(fn (User $u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'username' => $u->username,
                        'avatar' => $u->publicAvatarUrl(),
                    ])->values(),
                    'created_at' => $role->created_at?->toISOString(),
                    'updated_at' => $role->updated_at?->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $role = Role::create($validated);
        ActivityLog::log('created', "Created role: {$role->display_name}", $role);

        return response()->json([
            'success' => true,
            'data' => $role->loadCount('users'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,'.$id],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        if (in_array($role->name, self::SYSTEM_ROLES, true) && $validated['name'] !== $role->name) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot rename system role slug.',
            ], 422);
        }

        $role->update($validated);
        ActivityLog::log('updated', "Updated role: {$role->display_name}", $role);

        return response()->json([
            'success' => true,
            'data' => $role->loadCount('users'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $role = Role::withCount('users')->findOrFail($id);

        if ($role->users_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role with assigned users.',
            ], 422);
        }

        if (in_array($role->name, self::SYSTEM_ROLES, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete system roles.',
            ], 422);
        }

        $name = $role->display_name;
        $role->delete();
        ActivityLog::log('deleted', "Deleted role: {$name}");

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully.',
        ]);
    }
}
