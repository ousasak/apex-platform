<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Analytics\DashboardStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardStatsService $dashboardStats,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->dashboardStats->getStats($request->user())
        );
    }

    public function activity(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->dashboardStats->getRecentActivity($request->user())
        );
    }
}
