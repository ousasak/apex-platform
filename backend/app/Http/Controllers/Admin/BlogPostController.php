<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BlogPostRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\ActivityLog;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Services\SupabaseStorage;
use Cloudinary\Cloudinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::with(['author', 'category', 'series']);
        $mineOnly = $request->boolean('mine');

        // Regular admins only see their own posts; superadmins see all
        $user = $request->user();
        if ($user && $user->isAdmin() && (! $user->isSuperAdmin() || $mineOnly)) {
            $query->where('author_id', $user->id);
        }

        if ($search = $request->get('search')) {
            $like = '%'.strtolower(trim((string) $search)).'%';
            $query->whereRaw('LOWER(title) LIKE ?', [$like]);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $authorUsername = ltrim(trim((string) $request->get('author_username', '')), '@');
        if ($authorUsername !== '') {
            $authorLike = '%'.strtolower($authorUsername).'%';
            $query->whereHas('author', function ($userQuery) use ($authorLike) {
                $userQuery->whereRaw('LOWER(username) LIKE ?', [$authorLike]);
            });
        }

        if ($category = $request->get('category_id')) {
            $query->where('category_id', $category);
        }

        if ($seriesId = $request->get('series_id')) {
            $query->where('series_id', $seriesId);
        }

        $posts = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => BlogPostResource::collection($posts),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function store(BlogPostRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['author_id'] = auth()->id();

        if ($request->hasFile('cover_image')) {
            $provider = $request->input('storage_provider', 'supabase');
            $data['cover_image'] = $this->uploadCoverImage($request->file('cover_image'), $provider);
            $data['storage_provider'] = $provider;
        }

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = BlogPost::create($data);

        ActivityLog::log('created', "Created blog post: {$post->title}", $post);

        return response()->json([
            'success' => true,
            'data' => new BlogPostResource($post->load(['author', 'category', 'series'])),
            'message' => 'Blog post created successfully.',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $post = BlogPost::with(['author', 'category', 'series'])->findOrFail($id);

        if ($post->author_id !== auth()->id() && ! auth()->user()->isSuperAdmin()) {
            return response()->json(['success' => false, 'message' => 'You can only view your own blog posts.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new BlogPostResource($post),
        ]);
    }

    public function update(BlogPostRequest $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        if ($post->author_id !== auth()->id() && ! auth()->user()->isSuperAdmin()) {
            return response()->json(['success' => false, 'message' => 'You can only edit your own blog posts.'], 403);
        }

        $data = $request->validated();
        $oldCoverImage = $post->cover_image;
        $oldProvider = $post->storage_provider;
        $replacedCover = false;

        if ($request->hasFile('cover_image')) {
            $provider = $request->input('storage_provider', 'supabase');
            $data['cover_image'] = $this->uploadCoverImage($request->file('cover_image'), $provider);
            $data['storage_provider'] = $provider;
            $replacedCover = true;
        }

        if ($data['status'] === 'published' && ! $post->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post->update($data);

        if ($replacedCover && $oldCoverImage) {
            $this->deleteCoverImage($oldCoverImage, $oldProvider);
        }

        ActivityLog::log('updated', "Updated blog post: {$post->title}", $post);

        return response()->json([
            'success' => true,
            'data' => new BlogPostResource($post->fresh()->load(['author', 'category', 'series'])),
            'message' => 'Blog post updated successfully.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        if ($post->author_id !== auth()->id() && ! auth()->user()->isSuperAdmin()) {
            return response()->json(['success' => false, 'message' => 'You can only delete your own blog posts.'], 403);
        }

        $title = $post->title;
        $post->delete();

        ActivityLog::log('deleted', "Deleted blog post: {$title}");

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully.',
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => BlogCategory::withCount('posts')->get(),
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'unique:blog_categories,slug'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
        ]);

        $category = BlogCategory::create($data);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created successfully.',
        ], 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'unique:blog_categories,slug,'.$id],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
        ]);

        $category->update($data);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully.',
        ]);
    }

    public function destroyCategory(int $id): JsonResponse
    {
        BlogCategory::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }

    // ─── Storage Helpers ─────────────────────────────────────

    private function cloudinary(): Cloudinary
    {
        return new Cloudinary(config('cloudinary.cloud_url'));
    }

    private function uploadCoverImage($file, string $provider): string
    {
        if ($provider === 'cloudinary') {
            $result = $this->cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'apex/blog',
                'resource_type' => 'image',
            ]);

            return $result['secure_url'];
        }

        // Default: Supabase
        return app(SupabaseStorage::class)->upload($file, 'blog');
    }

    private function deleteCoverImage(?string $url, ?string $provider): void
    {
        if (! $url) {
            return;
        }

        try {
            if ($provider === 'cloudinary') {
                // Extract public ID from Cloudinary URL
                if (preg_match('/upload\/(?:v\d+\/)?(.+)\.\w+$/', $url, $m)) {
                    $this->cloudinary()->uploadApi()->destroy($m[1]);
                }
            } else {
                app(SupabaseStorage::class)->delete($url);
            }
        } catch (\Throwable $e) {
            // Log but don't fail the request
            \Log::warning("Failed to delete cover image: {$e->getMessage()}");
        }
    }
}
