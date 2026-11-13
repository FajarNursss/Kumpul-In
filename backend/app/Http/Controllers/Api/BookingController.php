<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings for the authenticated user.
     */
    public function index(Request $request)
    {
        $bookings = Booking::with('room')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Store a newly created booking with conflict validation,
     * daily booking handling, quota decrement, and proposal upload.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. Quota check (only for non-admin civitas)
        if ($user->role !== 'admin' && $user->booking_quota <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota booking Anda telah habis. Harap hubungi administrator.',
            ], 422);
        }

        // 2. Validate input
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'duration_type' => 'required|in:hourly,daily',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'proposal_file' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $room = Room::findOrFail($validated['room_id']);

        // 3. Handle Daily vs Hourly
        $durationType = $validated['duration_type'];

        if ($durationType === 'daily') {
            // Daily booking covers full operational campus hours (08:00 - 18:00 WIB)
            $startTime = '08:00:00';
            $endTime = '18:00:00';
        } else {
            // Hourly booking requires explicit start and end time
            if (empty($validated['start_time']) || empty($validated['end_time'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Waktu mulai dan waktu selesai wajib diisi untuk sewa per jam.',
                ], 422);
            }

            $startTime = $this->formatTime($validated['start_time']);
            $endTime = $this->formatTime($validated['end_time']);

            if ($startTime >= $endTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Waktu selesai harus lebih besar dari waktu mulai.',
                ], 422);
            }
        }

        // 4. Validate Aula proposal file requirement (for non-admin civitas)
        if ($room->category === 'Aula' && $user->role !== 'admin') {
            if (!$request->hasFile('proposal_file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peminjaman Aula kampus mewajibkan upload dokumen proposal atau surat izin kegiatan dalam format PDF.',
                ], 422);
            }
        }

        // 5. Conflict Validation (both confirmed and pending approval lock the slot)
        $existingBookings = Booking::where('room_id', $room->id)
            ->whereDate('booking_date', $validated['booking_date'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->get(['id', 'booking_code', 'start_time', 'end_time', 'duration_type']);

        foreach ($existingBookings as $existing) {
            // If existing is daily or new is daily, it conflicts with any booking on that date
            if ($existing->duration_type === 'daily' || $durationType === 'daily') {
                return response()->json([
                    'success' => false,
                    'message' => "Jadwal bentrok: Ruangan ini sudah memiliki reservasi ({$existing->booking_code}) pada tanggal tersebut.",
                ], 422);
            }

            $existingStart = strlen($existing->start_time) === 5 ? $existing->start_time . ':00' : $existing->start_time;
            $existingEnd = strlen($existing->end_time) === 5 ? $existing->end_time . ':00' : $existing->end_time;

            // Hourly conflict check: (start_baru < end_terdaftar) AND (end_baru > start_terdaftar)
            if ($startTime < $existingEnd && $endTime > $existingStart) {
                return response()->json([
                    'success' => false,
                    'message' => "Jadwal bentrok: Slot waktu {$startTime} - {$endTime} bersinggungan dengan reservasi ({$existing->booking_code}) {$existing->start_time} - {$existing->end_time}.",
                ], 422);
            }
        }

        // 6. Execute atomic transaction
        $proposalPath = null;
        if ($request->hasFile('proposal_file')) {
            $proposalPath = $request->file('proposal_file')->store('proposals', 'public');
        }

        $bookingCode = 'KMP-' . date('Ymd', strtotime($validated['booking_date'])) . '-' . strtoupper(Str::random(4));

        try {
            $booking = DB::transaction(function () use ($user, $room, $validated, $bookingCode, $startTime, $endTime, $durationType, $proposalPath) {
                // Biro Sarana (admin) bookings are confirmed immediately; students await approval (pending)
                $initialStatus = ($user->role === 'admin') ? 'confirmed' : 'pending';

                $createdBooking = Booking::create([
                    'booking_code' => $bookingCode,
                    'user_id' => $user->id,
                    'room_id' => $room->id,
                    'booking_date' => $validated['booking_date'],
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'duration_type' => $durationType,
                    'proposal_path' => $proposalPath,
                    'status' => $initialStatus,
                ]);

                // Decrement quota only for students/non-admin
                if ($user->role !== 'admin') {
                    $user->decrement('booking_quota');
                }

                return $createdBooking;
            });

            $responseMessage = ($user->role === 'admin')
                ? 'Reservasi peminjaman fasilitas oleh Biro Sarana berhasil dikonfirmasi secara langsung.'
                : 'Permohonan peminjaman berhasil diajukan dan sedang menunggu verifikasi/persetujuan Biro Sarana Kampus.';

            return response()->json([
                'success' => true,
                'message' => $responseMessage,
                'data' => [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'room_name' => $room->name,
                    'category' => $room->category,
                    'schedule' => "{$booking->booking_date->format('Y-m-d')} {$booking->start_time} - {$booking->end_time}",
                    'duration_type' => $booking->duration_type,
                    'status' => $booking->status,
                    'remaining_quota' => $user->fresh()->booking_quota,
                ],
            ], 201);
        } catch (\Throwable $e) {
            // Delete uploaded file if transaction failed
            if ($proposalPath && Storage::disk('public')->exists($proposalPath)) {
                Storage::disk('public')->delete($proposalPath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat memproses reservasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an active booking by the owning user and refund their quota.
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with('room')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (in_array($booking->status, ['cancelled', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman ruangan ini sudah tidak aktif (status: ' . $booking->status . ').',
            ], 422);
        }

        DB::transaction(function () use ($booking, $user) {
            $booking->update(['status' => 'cancelled']);
            $user->increment('booking_quota');
        });

        return response()->json([
            'success' => true,
            'message' => 'Peminjaman ruangan berhasil dibatalkan. Kuota 1 slot Anda telah dipulihkan.',
            'data' => [
                'booking' => $booking->fresh()->load('room'),
                'remaining_quota' => $user->fresh()->booking_quota,
            ],
        ]);
    }

    /**
     * Download proposal PDF.
     */
    public function downloadProposal($code)
    {
        $booking = Booking::where('booking_code', $code)->firstOrFail();

        if (!$booking->proposal_path || !Storage::disk('public')->exists($booking->proposal_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File proposal tidak ditemukan.',
            ], 404);
        }

        return Storage::disk('public')->download($booking->proposal_path);
    }

    private function formatTime(string $time): string
    {
        if (strlen($time) === 5) { // e.g. "09:00"
            return $time . ':00';
        }
        return $time;
    }
}
