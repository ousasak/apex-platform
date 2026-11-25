<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'role_applied' => ['required', 'string'],
            'github_url' => ['nullable', 'url'],
            'linkedin_url' => ['nullable', 'url'],
            'portfolio_url' => ['nullable', 'url'],
            'skills' => ['required', 'string'],
            'motivation' => ['required', 'string'],
        ]);

        $application = Application::create($validated);

        User::where('is_active', true)
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['superadmin', 'admin']))
            ->get()
            ->each(fn (User $admin) => $admin->notify(new GeneralNotification(
                'New Team Application',
                "{$application->name} applied for {$application->role_applied}.",
                'info',
                '/admin/applications'
            )));

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully! We will review it soon.',
        ], 201);
    }
}
