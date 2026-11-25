<?php

namespace App\Http\Controllers\PublicApi;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\Message;
use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(ContactRequest $request): JsonResponse
    {
        $message = Message::create($request->validated());

        User::where('is_active', true)
            ->whereHas('role', fn ($q) => $q->whereIn('name', ['superadmin', 'admin']))
            ->get()
            ->each(fn (User $admin) => $admin->notify(new GeneralNotification(
                'New Contact Message',
                "{$message->name} sent: {$message->subject}",
                'info',
                '/admin/messages'
            )));

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully. We will get back to you soon!',
        ], 201);
    }
}
