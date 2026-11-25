<?php

use App\Exceptions\ActionInterceptedException;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\DdosProtection;
use App\Http\Middleware\MemberMiddleware;
use App\Http\Middleware\SuperAdminMiddleware;
use App\Http\Middleware\VerifyTurnstile;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->prepend(DdosProtection::class);

        $middleware->alias([
            'auth' => Authenticate::class,
            'admin' => AdminMiddleware::class,
            'superadmin' => SuperAdminMiddleware::class,
            'member' => MemberMiddleware::class,
            'turnstile' => VerifyTurnstile::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        });

        $exceptions->render(function (ActionInterceptedException $e, Request $request) {
            return response()->json([
                'success' => false,
                'intercepted' => true,
                'message' => $e->getMessage(),
            ], 202);
        });
    })->create();
