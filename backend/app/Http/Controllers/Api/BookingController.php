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
        $bookings = Booking::with(['room', 'room.inventories'])
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
     * daily booking handling, recurring series handling, quota decrement, and proposal upload.
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
            'is_recurring' => 'nullable|boolean',
            'recurring_weeks' => 'nullable|integer|min:2|max:12',
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

        // 5. Build list of dates (Single or Recurring Series)
        $isRecurring = !empty($validated['is_recurring']) && $validated['is_recurring'] == true;
        $recurringWeeks = $isRecurring ? min(max((int)($validated['recurring_weeks'] ?? 4), 2), 12) : 1;
        $targetDates = [];
        $baseDate = $validated['booking_date'];

        for ($w = 0; $w < $recurringWeeks; $w++) {
            $targetDates[] = date('Y-m-d', strtotime("+{$w} week", strtotime($baseDate)));
        }

        // Check if student has enough quota for recurring series
        if ($user->role !== 'admin' && $user->booking_quota < count($targetDates)) {
            return response()->json([
                'success' => false,
                'message' => "Sisa kuota peminjaman Anda ({$user->booking_quota} slot) tidak mencukupi untuk membuat peminjaman rutin sebanyak " . count($targetDates) . " sesi mingguan.",
            ], 422);
        }

        // 6. Conflict Validation for each target date
        foreach ($targetDates as $tDate) {
            $existingBookings = Booking::where('room_id', $room->id)
                ->whereDate('booking_date', $tDate)
                ->whereIn('status', ['confirmed', 'pending'])
                ->get(['id', 'booking_code', 'start_time', 'end_time', 'duration_type']);

            foreach ($existingBookings as $existing) {
                if ($existing->duration_type === 'daily' || $durationType === 'daily') {
                    return response()->json([
                        'success' => false,
                        'message' => "Jadwal bentrok pada tanggal {$tDate}: Ruangan ini sudah memiliki reservasi ({$existing->booking_code}).",
                    ], 422);
                }

                $existingStart = strlen($existing->start_time) === 5 ? $existing->start_time . ':00' : $existing->start_time;
                $existingEnd = strlen($existing->end_time) === 5 ? $existing->end_time . ':00' : $existing->end_time;

                if ($startTime < $existingEnd && $endTime > $existingStart) {
                    return response()->json([
                        'success' => false,
                        'message' => "Jadwal bentrok pada tanggal {$tDate}: Slot waktu {$startTime} - {$endTime} bersinggungan dengan reservasi ({$existing->booking_code}) {$existing->start_time} - {$existing->end_time}.",
                    ], 422);
                }
            }
        }

        // 7. Execute atomic transaction
        $proposalPath = null;
        if ($request->hasFile('proposal_file')) {
            $proposalPath = $request->file('proposal_file')->store('proposals', 'public');
        }

        $recurringGroupId = $isRecurring ? 'REC-' . strtoupper(Str::random(8)) : null;

        try {
            $createdBookings = DB::transaction(function () use ($user, $room, $targetDates, $startTime, $endTime, $durationType, $proposalPath, $recurringGroupId) {
                $initialStatus = ($user->role === 'admin') ? 'confirmed' : 'pending';
                $bookingsList = [];

                foreach ($targetDates as $index => $tDate) {
                    $bookingCode = 'KMP-' . date('Ymd', strtotime($tDate)) . '-' . strtoupper(Str::random(4));
                    $checkinToken = 'CHK-' . strtoupper(Str::random(10));

                    $b = Booking::create([
                        'booking_code' => $bookingCode,
                        'user_id' => $user->id,
                        'room_id' => $room->id,
                        'booking_date' => $tDate,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'duration_type' => $durationType,
                        'proposal_path' => $proposalPath,
                        'status' => $initialStatus,
                        'checkin_token' => $checkinToken,
                        'recurring_group_id' => $recurringGroupId,
                    ]);

                    $bookingsList[] = $b;
                }

                // Decrement quota by number of dates for students/non-admin
                if ($user->role !== 'admin') {
                    $user->decrement('booking_quota', count($targetDates));
                }

                return $bookingsList;
            });

            $firstBooking = $createdBookings[0];
            $responseMessage = ($user->role === 'admin')
                ? ($isRecurring
                    ? "Rangkaian reservasi rutin sebanyak " . count($createdBookings) . " minggu oleh Biro Sarana berhasil dikonfirmasi secara langsung."
                    : 'Reservasi peminjaman fasilitas oleh Biro Sarana berhasil dikonfirmasi secara langsung.')
                : ($isRecurring
                    ? "Permohonan peminjaman rutin (" . count($createdBookings) . " minggu) berhasil diajukan dan sedang menunggu verifikasi/persetujuan Biro Sarana Kampus."
                    : 'Permohonan peminjaman berhasil diajukan dan sedang menunggu verifikasi/persetujuan Biro Sarana Kampus.');

            return response()->json([
                'success' => true,
                'message' => $responseMessage,
                'data' => [
                    'id' => $firstBooking->id,
                    'booking_code' => $firstBooking->booking_code,
                    'room_name' => $room->name,
                    'category' => $room->category,
                    'schedule' => "{$firstBooking->booking_date->format('Y-m-d')} {$firstBooking->start_time} - {$firstBooking->end_time}",
                    'duration_type' => $firstBooking->duration_type,
                    'status' => $firstBooking->status,
                    'checkin_token' => $firstBooking->checkin_token,
                    'is_recurring' => $isRecurring,
                    'recurring_count' => count($createdBookings),
                    'recurring_group_id' => $recurringGroupId,
                    'remaining_quota' => $user->fresh()->booking_quota,
                ],
            ], 201);
        } catch (\Throwable $e) {
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
     * Reschedule an active booking (change date & time slot).
     */
    public function reschedule(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with('room')->where('id', $id)->firstOrFail();

        if ($user->role !== 'admin' && $booking->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki otorisasi untuk mengubah jadwal peminjaman ini.',
            ], 403);
        }

        if (in_array($booking->status, ['cancelled', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman yang telah dibatalkan atau ditolak tidak dapat diubah jadwalnya.',
            ], 422);
        }

        $validated = $request->validate([
            'booking_date' => 'required|date|after_or_equal:today',
            'duration_type' => 'required|in:hourly,daily',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
        ]);

        $durationType = $validated['duration_type'];
        if ($durationType === 'daily') {
            $startTime = '08:00:00';
            $endTime = '18:00:00';
        } else {
            if (empty($validated['start_time']) || empty($validated['end_time'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Waktu mulai dan selesai wajib ditentukan.',
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

        // Conflict check excluding this booking itself
        $existingBookings = Booking::where('room_id', $booking->room_id)
            ->where('id', '!=', $booking->id)
            ->whereDate('booking_date', $validated['booking_date'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->get(['id', 'booking_code', 'start_time', 'end_time', 'duration_type']);

        foreach ($existingBookings as $existing) {
            if ($existing->duration_type === 'daily' || $durationType === 'daily') {
                return response()->json([
                    'success' => false,
                    'message' => "Jadwal bentrok: Ruangan ini sudah memiliki reservasi ({$existing->booking_code}) pada tanggal tersebut.",
                ], 422);
            }

            $existingStart = strlen($existing->start_time) === 5 ? $existing->start_time . ':00' : $existing->start_time;
            $existingEnd = strlen($existing->end_time) === 5 ? $existing->end_time . ':00' : $existing->end_time;

            if ($startTime < $existingEnd && $endTime > $existingStart) {
                return response()->json([
                    'success' => false,
                    'message' => "Jadwal bentrok: Slot waktu {$startTime} - {$endTime} bersinggungan dengan reservasi ({$existing->booking_code}) {$existing->start_time} - {$existing->end_time}.",
                ], 422);
            }
        }

        $booking->update([
            'booking_date' => $validated['booking_date'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration_type' => $durationType,
            'rescheduled_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Jadwal peminjaman {$booking->booking_code} berhasil diubah ke tanggal {$booking->booking_date->format('Y-m-d')} ({$booking->start_time} - {$booking->end_time} WIB).",
            'data' => $booking->fresh(['room', 'room.inventories']),
        ]);
    }

    /**
     * Check-in attendance for a confirmed booking.
     */
    public function checkIn(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with('room')->where('id', $id)->firstOrFail();

        if ($user->role !== 'admin' && $booking->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melakukan check-in pada peminjaman ini.',
            ], 403);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Check-in hanya dapat dilakukan untuk reservasi yang telah disetujui (status: Disetujui).',
            ], 422);
        }

        if ($booking->checked_in_at) {
            return response()->json([
                'success' => true,
                'message' => 'Peminjaman ini sudah diverifikasi hadir pada ' . $booking->checked_in_at->format('d/m/Y H:i') . ' WIB.',
                'data' => $booking,
            ]);
        }

        $booking->update([
            'checked_in_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kehadiran fisik di ruangan {$booking->room->name} berhasil diverifikasi pada " . now()->format('H:i') . " WIB.",
            'data' => $booking->fresh(['room']),
        ]);
    }

    /**
     * Check-in attendance by scanning QR Code token.
     */
    public function checkInByToken(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $booking = Booking::with(['room', 'user'])
            ->where('checkin_token', $validated['token'])
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Token QR Code tidak valid atau reservasi tidak ditemukan.',
            ], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => "Peminjaman dengan kode {$booking->booking_code} belum berstatus Disetujui (Status saat ini: {$booking->status}).",
            ], 422);
        }

        if ($booking->checked_in_at) {
            return response()->json([
                'success' => true,
                'message' => "Reservasi {$booking->booking_code} ({$booking->user->name}) sudah melakukan check-in sebelumnya pada " . $booking->checked_in_at->format('d/m/Y H:i') . " WIB.",
                'data' => $booking,
            ]);
        }

        $booking->update([
            'checked_in_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Check-in QR Code berhasil! Kehadiran {$booking->user->name} di {$booking->room->name} terverifikasi pada " . now()->format('H:i') . " WIB.",
            'data' => $booking->fresh(['room', 'user']),
        ]);
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
