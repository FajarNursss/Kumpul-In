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
Route::post('/bookings/checkin-by-token', [BookingController::class, 'checkInByToken']);

// Protected User endpoints using Laravel Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::patch('/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);
    Route::post('/bookings/{id}/checkin', [BookingController::class, 'checkIn']);

    // Admin Specific endpoints
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::get('/bookings/export-csv', [AdminController::class, 'exportCsv']);
        Route::post('/bookings/auto-release', [AdminController::class, 'autoReleaseGhostBookings']);
        Route::patch('/bookings/{id}/status', [AdminController::class, 'updateBookingStatus']);
        Route::post('/rooms', [AdminController::class, 'storeRoom']);
        Route::patch('/rooms/{id}', [AdminController::class, 'updateRoom']);
        Route::delete('/rooms/{id}', [AdminController::class, 'deleteRoom']);

        // Room Inventories Management
        Route::get('/rooms/{roomId}/inventories', [AdminController::class, 'inventories']);
        Route::post('/rooms/{roomId}/inventories', [AdminController::class, 'storeInventory']);
        Route::patch('/inventories/{id}', [AdminController::class, 'updateInventory']);
        Route::delete('/inventories/{id}', [AdminController::class, 'deleteInventory']);

        // User Management (CRUD User)
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });
});
