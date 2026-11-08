<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

// Public Authentication endpoints
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/quick-login', [AuthController::class, 'quickLogin']);

// Public Room Catalog and Availability endpoints (US-01, US-02)
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}/availability', [RoomController::class, 'availability']);
Route::get('/bookings/proposal/{code}', [BookingController::class, 'downloadProposal']);

// Protected endpoints using Laravel Sanctum (US-03, US-04, US-05)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
});
