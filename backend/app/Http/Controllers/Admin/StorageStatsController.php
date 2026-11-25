<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Storage\StorageStatsService;
use Illuminate\Http\JsonResponse;

class StorageStatsController extends Controller
{
    public function __construct(
        private readonly StorageStatsService $storageStats,
    ) {}

    public function index(): JsonResponse
    {
        return $this->successResponse($this->storageStats->getCachedStats());
    }

    public function refresh(): JsonResponse
    {
        return $this->successResponse($this->storageStats->refresh());
    }
}
