<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminSearchRequest;
use App\Services\Search\AdminSearchService;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function __construct(
        private readonly AdminSearchService $searchService,
    ) {}

    public function search(AdminSearchRequest $request): JsonResponse
    {
        $payload = $this->searchService->search(
            user: $request->user(),
            queryText: (string) $request->validated('q'),
            filter: (string) ($request->validated('filter') ?? 'all'),
        );

        return $this->successResponse(
            data: $payload['results'],
            extra: ['totals' => $payload['totals']],
        );
    }
}
