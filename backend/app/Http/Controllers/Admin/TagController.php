<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTagRequest;
use App\Http\Requests\Admin\UpdateTagRequest;
use App\Models\ActivityLog;
use App\Models\Tag;
use App\Services\Storage\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TagController extends Controller
{
    public function __construct(
        private readonly SupabaseStorageService $supabase,
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(
            Tag::withCount('projects')->orderBy('name')->get()
        );
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $data = $request->validated();
        unset($data['logo_file']);

        if ($request->hasFile('logo_file')) {
            $data['logo'] = $this->storeLogoFile($request->file('logo_file'));
        } elseif (array_key_exists('logo', $data) && trim((string) $data['logo']) === '') {
            $data['logo'] = null;
        }

        $tag = Tag::create($data);
        ActivityLog::log('created', "Created tag: {$tag->name}", $tag);

        return $this->successResponse($tag->loadCount('projects'), status: 201);
    }

    public function update(UpdateTagRequest $request, int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);
        $data = $request->validated();
        unset($data['logo_file']);

        if ($request->hasFile('logo_file')) {
            $data['logo'] = $this->storeLogoFile($request->file('logo_file'));
        } elseif (array_key_exists('logo', $data) && trim((string) $data['logo']) === '') {
            $data['logo'] = null;
        }

        $tag->update($data);
        ActivityLog::log('updated', "Updated tag: {$tag->name}", $tag);

        return $this->successResponse($tag->fresh()->loadCount('projects'));
    }

    public function destroy(int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);
        $name = $tag->name;
        $tag->delete();

        ActivityLog::log('deleted', "Deleted tag: {$name}");

        return $this->successResponse(message: 'Tag deleted.');
    }

    private function storeLogoFile(UploadedFile $file): string
    {
        if ($this->supabase->isConfigured() && ! app()->runningUnitTests()) {
            try {
                $path = $this->supabase->upload($file, 'tags');
                $resolved = $path ? $this->supabase->url($path) : null;
                if ($resolved) {
                    return $resolved;
                }
            } catch (\Throwable) {
                // Fall back to local public storage disk below
            }
        }

        $path = Storage::disk('public')->putFile('tags', $file);

        return url('storage/'.$path);
    }
}
