<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Docs\ReorderDocsAction;
use App\Actions\Docs\SaveDocSectionsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderDocsRequest;
use App\Http\Requests\Admin\StoreDocRequest;
use App\Http\Requests\Admin\UpdateDocRequest;
use App\Models\ActivityLog;
use App\Models\Doc;
use App\Models\DocCategory;
use App\Support\PublicApiCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Doc::with('author');

            if ($search = $request->get('search')) {
                $like = '%'.strtolower(trim((string) $search)).'%';
                $query->whereRaw('LOWER(title) LIKE ?', [$like]);
            }

            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }

            if ($category = $request->get('category')) {
                $query->whereJsonContains('categories', $category);
            }

            $docs = $query->orderBy('category_order')
                ->orderBy('category')
                ->orderBy('order_num')
                ->orderByDesc('created_at')
                ->paginate(20);

            return $this->paginatedResponse($docs);
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function all(): JsonResponse
    {
        try {
            $docs = Doc::select('id', 'title', 'slug', 'parent_id', 'doc_menu_id', 'category', 'category_order', 'order_num', 'status')
                ->orderBy('category_order')
                ->orderBy('category')
                ->orderBy('order_num')
                ->get();

            return $this->successResponse($docs);
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(StoreDocRequest $request, SaveDocSectionsAction $saveSections): JsonResponse
    {
        $data = $request->validated();
        $sections = $data['sections'] ?? [];
        unset($data['sections']);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['author_id'] = auth()->id();
        $data['content'] = $data['content'] ?? '';
        $data['categories'] = $data['categories'] ?? ['General'];
        $data['category'] = $data['categories'][0] ?? 'General';

        $doc = Doc::create($data);
        $saveSections->execute($doc, $sections, replaceExisting: false);

        ActivityLog::log('created', "Created doc: {$doc->title}", $doc);
        PublicApiCache::forgetDocs();
        PublicApiCache::forgetDocShow($doc->slug);

        return $this->successResponse($doc->load(['author', 'sections']), 'Doc created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        $doc = Doc::with(['author', 'sections'])->findOrFail($id);

        return $this->successResponse($doc);
    }

    public function update(UpdateDocRequest $request, int $id, SaveDocSectionsAction $saveSections): JsonResponse
    {
        $doc = Doc::findOrFail($id);
        $data = $request->validated();

        $sections = $data['sections'] ?? [];
        unset($data['sections']);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['categories'] = $data['categories'] ?? ($doc->categories ?? ['General']);
        $data['category'] = $data['categories'][0] ?? 'General';

        if (! empty($data['parent_id']) && (int) $data['parent_id'] === $id) {
            $data['parent_id'] = null;
        }

        $doc->update($data);
        $saveSections->execute($doc, $sections, replaceExisting: true);

        ActivityLog::log('updated', "Updated doc: {$doc->title}", $doc);
        PublicApiCache::forgetDocs();
        PublicApiCache::forgetDocShow($doc->slug);

        return $this->successResponse($doc->load(['author', 'sections']), 'Doc updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $doc = Doc::findOrFail($id);

        ActivityLog::log('deleted', "Deleted doc: {$doc->title}", $doc);
        PublicApiCache::forgetDocs();
        PublicApiCache::forgetDocShow($doc->slug);
        $doc->sections()->delete();
        $doc->delete();

        return $this->successResponse(message: 'Doc deleted.');
    }

    public function categories(): JsonResponse
    {
        $categories = DocCategory::orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'doc_count' => Doc::whereJsonContains('categories', $cat->name)->count(),
            ]);

        return $this->successResponse($categories);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:doc_categories,name'],
        ]);

        $cat = DocCategory::create(['name' => $data['name']]);
        ActivityLog::log('created', "Created doc category: {$cat->name}", null);

        return $this->successResponse(
            ['id' => $cat->id, 'name' => $cat->name, 'doc_count' => 0],
            'Category created.',
            201
        );
    }

    public function renameCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'old_name' => ['required', 'string', 'max:100'],
            'new_name' => ['required', 'string', 'max:100', 'unique:doc_categories,name'],
        ]);

        $cat = DocCategory::where('name', $data['old_name'])->firstOrFail();
        $cat->update(['name' => $data['new_name']]);

        $docs = Doc::whereJsonContains('categories', $data['old_name'])->get();
        $count = $docs->count();
        foreach ($docs as $doc) {
            $cats = array_map(fn ($c) => $c === $data['old_name'] ? $data['new_name'] : $c, $doc->categories ?? []);
            $doc->update(['categories' => $cats, 'category' => $cats[0] ?? $data['new_name']]);
        }

        ActivityLog::log('updated', "Renamed category \"{$data['old_name']}\" → \"{$data['new_name']}\" ({$count} docs)", null);

        return $this->successResponse(message: "Renamed. {$count} doc(s) updated.");
    }

    public function deleteCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'move_to' => ['nullable', 'string', 'max:100'],
        ]);

        $moveTo = $data['move_to'] ?? 'General';

        $docs = Doc::whereJsonContains('categories', $data['name'])->get();
        $count = $docs->count();
        foreach ($docs as $doc) {
            $cats = array_filter($doc->categories ?? [], fn ($c) => $c !== $data['name']);
            if (empty($cats)) {
                $cats = [$moveTo];
            }
            $cats = array_values($cats);
            $doc->update(['categories' => $cats, 'category' => $cats[0]]);
        }

        DocCategory::where('name', $data['name'])->delete();
        DocCategory::firstOrCreate(['name' => $moveTo]);

        ActivityLog::log('deleted', "Deleted category \"{$data['name']}\", moved {$count} doc(s) to \"{$moveTo}\"", null);

        return $this->successResponse(message: "Category deleted. {$count} doc(s) moved to \"{$moveTo}\".");
    }

    public function reorder(ReorderDocsRequest $request, ReorderDocsAction $action): JsonResponse
    {
        $action->execute($request->validated('items'));

        return $this->successResponse(message: 'Order saved successfully.');
    }
}
