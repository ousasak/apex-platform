<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Media\DeleteMediaAction;
use App\Actions\Media\UploadMediaAction;
use App\Exceptions\ActionInterceptedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadMediaRequest;
use App\Http\Resources\Admin\MediaResource;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class MediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('uploader')->orderByDesc('created_at');

        $user = $request->user();
        if ($user && $user->isAdmin() && ! $user->isSuperAdmin()) {
            $query->where('uploaded_by', $user->id);
        }

        if ($request->filled('search')) {
            $like = '%'.strtolower(trim((string) $request->input('search'))).'%';
            $query->whereRaw('LOWER(original_name) LIKE ?', [$like]);
        }

        if ($request->filled('type')) {
            $type = $request->input('type');
            if ($type === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($type === 'document') {
                $query->where('mime_type', 'not like', 'image/%');
            }
        }

        $perPage = min(100, max(1, (int) $request->input('per_page', 24)));
        $media = $query->paginate($perPage);

        return $this->paginatedResponse($media, MediaResource::collection($media));
    }

    public function upload(UploadMediaRequest $request, UploadMediaAction $action): JsonResponse
    {
        try {
            $uploaded = $action->execute(
                file: $request->file('file'),
                provider: (string) $request->input('storage_provider', 'supabase'),
                uploaderId: auth()->id(),
            );

            $responseData = $uploaded['media']->toArray();
            $responseData['url'] = $uploaded['url'];

            return $this->successResponse($responseData, 'File uploaded successfully.', 201);
        } catch (ActionInterceptedException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Media upload failed', ['error' => $e->getMessage()]);

            return $this->errorResponse('Storage error: '.$e->getMessage(), 500);
        }
    }

    public function destroy(int $id, DeleteMediaAction $action): JsonResponse
    {
        $media = Media::findOrFail($id);

        if (Gate::denies('delete', $media)) {
            return $this->errorResponse('You can only delete your own media files.', 403);
        }

        $action->execute($media);

        return $this->successResponse(message: 'Media deleted successfully.');
    }
}
