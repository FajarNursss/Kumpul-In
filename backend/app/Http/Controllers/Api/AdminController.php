<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Ensure the user is an admin.
     */
    private function authorizeAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Hanya administrator yang dapat mengakses resource ini.',
            ], 403));
        }
    }

    /**
     * Dashboard overview statistics for Admin.
     */
    public function stats(Request $request)
    {
        $this->authorizeAdmin($request);

        $totalUsers = User::where('role', '!=', 'admin')->count();
        $totalRooms = Room::count();
        $activeRooms = Room::where('is_active', true)->count();
        $totalBookings = Booking::count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $todayBookings = Booking::whereDate('booking_date', now()->format('Y-m-d'))->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'total_rooms' => $totalRooms,
                'active_rooms' => $activeRooms,
                'total_bookings' => $totalBookings,
                'confirmed_bookings' => $confirmedBookings,
                'today_bookings' => $todayBookings,
            ],
        ]);
    }

    /**
     * List all bookings with user and room information.
     */
    public function bookings(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = Booking::with(['user', 'room'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('booking_date', $request->query('date'));
        }

        $bookings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Update booking status (confirm or cancel).
     */
    public function updateBookingStatus(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $newStatus = $validated['status'];

        $booking->status = $newStatus;
        $booking->save();

        // If booking is cancelled, restore user quota
        if ($oldStatus === 'confirmed' && $newStatus === 'cancelled') {
            $booking->user->increment('booking_quota');
        }

        return response()->json([
            'success' => true,
            'message' => "Status reservasi {$booking->booking_code} berhasil diperbarui menjadi {$newStatus}.",
            'data' => $booking->fresh(['user', 'room']),
        ]);
    }

    /**
     * Create a new room.
     */
    public function storeRoom(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'category' => 'required|in:Meeting Pod,Open Desk,Event Space',
            'capacity' => 'required|integer|min:1',
            'price_per_hour' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $room = Room::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'capacity' => $validated['capacity'],
            'price_per_hour' => $validated['price_per_hour'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ruangan baru berhasil ditambahkan.',
            'data' => $room,
        ], 201);
    }

    /**
     * Update room details or active toggle.
     */
    public function updateRoom(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'category' => 'sometimes|required|in:Meeting Pod,Open Desk,Event Space',
            'capacity' => 'sometimes|required|integer|min:1',
            'price_per_hour' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil diperbarui.',
            'data' => $room,
        ]);
    }

    /**
     * Delete room.
     */
    public function deleteRoom(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $room = Room::findOrFail($id);
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ruangan berhasil dihapus.',
        ]);
    }
}

