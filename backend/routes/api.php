<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// Public Authentication endpoints
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/quick-login', [AuthController::class, 'quickLogin']);

// Public Room Catalog and Availability endpoints (US-01, US-02)
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}/availability', [RoomController::class, 'availability']);
Route::get('/bookings/proposal/{code}', [BookingController::class, 'downloadProposal']);

// Protected User endpoints using Laravel Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);

    // Admin Specific endpoints
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::patch('/bookings/{id}/status', [AdminController::class, 'updateBookingStatus']);
        Route::post('/rooms', [AdminController::class, 'storeRoom']);
        Route::patch('/rooms/{id}', [AdminController::class, 'updateRoom']);
        Route::delete('/rooms/{id}', [AdminController::class, 'deleteRoom']);
    });
});
