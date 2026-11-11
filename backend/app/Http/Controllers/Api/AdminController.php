<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $todayBookings = Booking::whereDate('booking_date', now()->format('Y-m-d'))->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'total_rooms' => $totalRooms,
                'active_rooms' => $activeRooms,
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
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
            'status' => 'required|in:confirmed,rejected,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $newStatus = $validated['status'];

        $booking->status = $newStatus;
        $booking->save();

        // If booking is rejected or cancelled, restore user quota
        if (in_array($oldStatus, ['pending', 'confirmed']) && in_array($newStatus, ['rejected', 'cancelled'])) {
            $booking->user->increment('booking_quota');
        }

        $statusLabels = [
            'confirmed' => 'Disetujui',
            'rejected' => 'Ditolak',
            'cancelled' => 'Dibatalkan',
        ];
        $label = $statusLabels[$newStatus] ?? $newStatus;

        return response()->json([
            'success' => true,
            'message' => "Permohonan reservasi {$booking->booking_code} berhasil diubah statusnya menjadi \"{$label}\".",
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
            'category' => 'required|in:Aula,Perpustakaan,Meeting Room,Ruang Belajar',
            'capacity' => 'required|integer|min:1',
            'price_per_hour' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $room = Room::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'capacity' => $validated['capacity'],
            'price_per_hour' => $validated['price_per_hour'] ?? 0.00,
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
            'category' => 'sometimes|required|in:Aula,Perpustakaan,Meeting Room,Ruang Belajar',
            'capacity' => 'sometimes|required|integer|min:1',
            'price_per_hour' => 'sometimes|nullable|numeric|min:0',
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

    /**
     * List all users with optional role and search query filter.
     */
    public function users(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = User::withCount('bookings')->orderBy('created_at', 'desc');

        if ($request->filled('role') && $request->query('role') !== 'all') {
            $query->where('role', $request->query('role'));
        }

        if ($request->filled('q')) {
            $search = '%' . $request->query('q') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search);
            });
        }

        $users = $query->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user (Admin or Mahasiswa).
     */
    public function storeUser(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:mahasiswa,admin',
            'booking_quota' => 'nullable|integer|min:0',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah terdaftar pada sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'role.required' => 'Peran pengguna wajib ditentukan.',
            'role.in' => 'Peran pengguna harus mahasiswa atau admin.',
        ]);

        $defaultQuota = $validated['role'] === 'admin' ? 999 : 5;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'booking_quota' => $validated['booking_quota'] ?? $defaultQuota,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Pengguna {$user->name} berhasil ditambahkan.",
            'data' => $user,
        ], 201);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|in:mahasiswa,admin',
            'booking_quota' => 'sometimes|required|integer|min:0',
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah digunakan oleh pengguna lain.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'role.in' => 'Peran pengguna harus mahasiswa atau admin.',
            'booking_quota.min' => 'Kuota peminjaman tidak boleh negatif.',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Data pengguna {$user->name} berhasil diperbarui.",
            'data' => $user->fresh(),
        ]);
    }

    /**
     * Delete an existing user.
     */
    public function deleteUser(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $name = $user->name;
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Pengguna {$name} berhasil dihapus dari sistem.",
        ]);
    }
}

